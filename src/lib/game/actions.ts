'use server'

import { createClient } from '@/lib/supabase/server'
import { HOK_QUESTIONS } from './seedData'
import { generateJoinCode, calculateScore } from './utils'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function loginWithMagicLink(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const fullName = formData.get('full_name') as string

  if (fullName) {
    // Store name in localStorage via cookie for profile creation after magic link click
    // We store it temporarily so we can create the profile on first login
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
      data: { full_name: fullName },
    },
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function createGameSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Ensure trainer profile exists
  const { data: profile } = await supabase
    .from('trainer_profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    await supabase.from('trainer_profiles').insert({
      id: user.id,
      full_name: user.user_metadata?.full_name ?? user.email ?? 'Trainer',
    })
  }

  // Find or create the default quiz
  let quizId: string
  const { data: existingQuiz } = await supabase
    .from('quizzes')
    .select('id')
    .eq('trainer_id', user.id)
    .single()

  if (existingQuiz) {
    quizId = existingQuiz.id
  } else {
    const { data: newQuiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({ trainer_id: user.id, title: 'EHBO Quiz – Het Oranje Kruis' })
      .select('id')
      .single()

    if (quizError || !newQuiz) return { error: quizError?.message ?? 'Quiz aanmaken mislukt' }
    quizId = newQuiz.id

    // Seed questions
    const questionsToInsert = HOK_QUESTIONS.map((q, i) => ({
      quiz_id: quizId,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      time_limit: q.time_limit,
      order_index: i,
    }))
    await supabase.from('questions').insert(questionsToInsert)
  }

  // Generate unique join code
  let joinCode = generateJoinCode()
  let attempts = 0
  while (attempts < 10) {
    const { data: existing } = await supabase
      .from('game_sessions')
      .select('id')
      .eq('join_code', joinCode)
      .single()
    if (!existing) break
    joinCode = generateJoinCode()
    attempts++
  }

  const { data: session, error } = await supabase
    .from('game_sessions')
    .insert({
      quiz_id: quizId,
      trainer_id: user.id,
      join_code: joinCode,
      status: 'lobby',
      current_question: -1,
    })
    .select('id')
    .single()

  if (error || !session) return { error: error?.message ?? 'Sessie aanmaken mislukt' }
  return { sessionId: session.id, joinCode }
}

export async function advanceGame(sessionId: string, action: 'next' | 'finish') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Niet ingelogd' }

  const { data: session } = await supabase
    .from('game_sessions')
    .select('current_question, status, quiz_id')
    .eq('id', sessionId)
    .single()

  if (!session) return { error: 'Sessie niet gevonden' }

  if (action === 'finish') {
    await supabase
      .from('game_sessions')
      .update({ status: 'finished' })
      .eq('id', sessionId)
    return { done: true }
  }

  const nextQuestion = session.current_question + 1
  const isLastQuestion = nextQuestion >= HOK_QUESTIONS.length

  if (isLastQuestion) {
    await supabase
      .from('game_sessions')
      .update({ status: 'results', current_question: nextQuestion })
      .eq('id', sessionId)
    return { done: true }
  }

  await supabase
    .from('game_sessions')
    .update({
      status: 'playing',
      current_question: nextQuestion,
      question_started_at: new Date().toISOString(),
    })
    .eq('id', sessionId)

  return { questionIndex: nextQuestion }
}

export async function joinSession(formData: FormData) {
  const supabase = await createClient()
  const nickname = (formData.get('nickname') as string).trim()
  const joinCode = (formData.get('join_code') as string).trim().toUpperCase()

  const { data: session } = await supabase
    .from('game_sessions')
    .select('id, status')
    .eq('join_code', joinCode)
    .in('status', ['lobby', 'playing'])
    .single()

  if (!session) return { error: 'Sessie niet gevonden of al afgelopen.' }

  const { data: player, error } = await supabase
    .from('game_players')
    .insert({ session_id: session.id, nickname })
    .select('id')
    .single()

  if (error || !player) return { error: 'Kon niet joinen. Probeer opnieuw.' }

  return { sessionId: session.id, playerId: player.id }
}

export async function submitAnswer(
  sessionId: string,
  playerId: string,
  questionIndex: number,
  answer: number,
  responseTimeMs: number,
  timeLimitSeconds: number
) {
  const supabase = await createClient()

  const { data: question } = await supabase
    .from('questions')
    .select('correct_answer')
    .eq('quiz_id', (
      await supabase
        .from('game_sessions')
        .select('quiz_id')
        .eq('id', sessionId)
        .single()
    ).data?.quiz_id ?? '')
    .eq('order_index', questionIndex)
    .single()

  const isCorrect = question?.correct_answer === answer
  const pointsEarned = isCorrect ? calculateScore(responseTimeMs, timeLimitSeconds) : 0

  const { error } = await supabase.from('game_answers').insert({
    session_id: sessionId,
    player_id: playerId,
    question_index: questionIndex,
    answer,
    is_correct: isCorrect,
    response_time_ms: responseTimeMs,
    points_earned: pointsEarned,
  })

  if (!error && isCorrect) {
    await supabase.rpc('increment_player_score', {
      p_player_id: playerId,
      p_points: pointsEarned,
    })
  }

  return { isCorrect, pointsEarned }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
