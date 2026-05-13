'use server'

import { createClient } from '@/lib/supabase/server'
import { generateJoinCode, calculateScore } from './utils'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Question } from '@/types/game'

export async function loginWithMagicLink(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const fullName = formData.get('full_name') as string

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
      data: { full_name: fullName },
      shouldCreateUser: true,
    },
  })

  if (error) return { error: error.message }
  return { success: true }
}


export async function createGameSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: existingProfile } = await supabase
      .from('trainer_profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      await supabase.from('trainer_profiles').insert({
        id: user.id,
        full_name: user.user_metadata?.full_name ?? user.email ?? 'Trainer',
        role: 'trainer',
      })
    }
  }

  // Altijd de globale HOK master quiz gebruiken
  const { data: masterQuiz } = await supabase
    .from('quizzes')
    .select('id')
    .is('trainer_id', null)
    .limit(1)
    .single()

  if (!masterQuiz) {
    return { error: 'HOK master quiz niet gevonden. Voer eerst de database migration uit.' }
  }

  // Genereer unieke join code
  let joinCode = generateJoinCode()
  for (let i = 0; i < 10; i++) {
    const { data: existing } = await supabase
      .from('game_sessions')
      .select('id')
      .eq('join_code', joinCode)
      .maybeSingle()
    if (!existing) break
    joinCode = generateJoinCode()
  }

  const { data: session, error } = await supabase
    .from('game_sessions')
    .insert({
      quiz_id: masterQuiz.id,
      trainer_id: user?.id ?? null,
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

  // Vraagaantal ophalen uit DB (niet hardcoded)
  const { count: questionCount } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('quiz_id', session.quiz_id)

  const nextQuestion = session.current_question + 1
  const isLastQuestion = nextQuestion >= (questionCount ?? 10)

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

  const { data: sessionData } = await supabase
    .from('game_sessions')
    .select('quiz_id')
    .eq('id', sessionId)
    .single()

  const { data: question } = await supabase
    .from('questions')
    .select('correct_answer')
    .eq('quiz_id', sessionData?.quiz_id ?? '')
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

// ============================================================
// HOK Admin actions — geen auth-guard (auth is verwijderd voor MVP)
// ============================================================

export async function getAdminQuestions(): Promise<Question[]> {
  const supabase = await createClient()
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('id')
    .is('trainer_id', null)
    .single()

  if (!quiz) return []

  const { data } = await supabase
    .from('questions')
    .select('*')
    .eq('quiz_id', quiz.id)
    .order('order_index')

  return (data as Question[]) ?? []
}

export async function updateQuestion(
  questionId: string,
  updates: {
    question: string
    options: string[]
    correct_answer: number
    explanation: string
    time_limit: number
    video_topic: string
    video_url: string
  }
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('questions')
    .update(updates)
    .eq('id', questionId)

  if (error) return { error: error.message }
  revalidatePath('/admin/questions')
  return { success: true }
}

export async function addQuestion(data: {
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  time_limit: number
  video_topic: string
  video_url: string
}) {
  const supabase = await createClient()

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('id')
    .is('trainer_id', null)
    .single()

  if (!quiz) return { error: 'Master quiz niet gevonden' }

  const { count } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('quiz_id', quiz.id)

  const { error } = await supabase.from('questions').insert({
    ...data,
    quiz_id: quiz.id,
    order_index: count ?? 0,
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/questions')
  return { success: true }
}

export async function deleteQuestion(questionId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId)

  if (error) return { error: error.message }
  revalidatePath('/admin/questions')
  return { success: true }
}
