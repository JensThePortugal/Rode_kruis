'use client'

import { useState, useEffect } from 'react'
import { useGameSession } from '@/hooks/useGameSession'
import { useQuestions } from '@/hooks/useQuestions'
import { useAnswers } from '@/hooks/useAnswers'
import { useGameStore } from '@/store/gameStore'
import { createClient } from '@/lib/supabase/client'
import { WaitingRoom } from '@/components/player/WaitingRoom'
import { QuestionView } from '@/components/player/QuestionView'
import { AnswerFeedback } from '@/components/player/AnswerFeedback'
import { ScoreView } from '@/components/player/ScoreView'
import type { GamePlayer } from '@/types/game'

interface Props {
  sessionId: string
  playerId: string
}

interface AnswerResult {
  isCorrect: boolean
  pointsEarned: number
  answer: number
}

export function PlayerGameClient({ sessionId, playerId }: Props) {
  const session = useGameSession(sessionId)
  const questions = useQuestions(session?.quiz_id)
  useAnswers(sessionId)
  const { answers } = useGameStore()
  const [me, setMe] = useState<GamePlayer | null>(null)
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null)
  const [lastAnsweredQuestion, setLastAnsweredQuestion] = useState<number>(-1)
  const [streak, setStreak] = useState<number>(0)

  // Load player info + subscribe to score updates
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('game_players')
      .select('*')
      .eq('id', playerId)
      .single()
      .then(({ data }) => { if (data) setMe(data as GamePlayer) })

    const channel = supabase
      .channel(`player:${playerId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_players', filter: `id=eq.${playerId}` },
        (payload) => setMe(payload.new as GamePlayer)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [playerId])

  const currentQuestion = session?.current_question ?? -1
  const myAnswerForCurrentQuestion = answers.find(
    a => a.player_id === playerId && a.question_index === currentQuestion
  )
  const alreadyAnswered = !!myAnswerForCurrentQuestion

  function handleAnswered(result: AnswerResult) {
    setAnswerResult(result)
    setLastAnsweredQuestion(currentQuestion)
    if (result.isCorrect) {
      setStreak(prev => prev + 1)
      if (me) {
        setMe(prev => prev ? { ...prev, score: prev.score + result.pointsEarned } : prev)
      }
    } else {
      setStreak(0)
    }
  }

  // Reset answer result when question changes
  useEffect(() => {
    if (currentQuestion !== lastAnsweredQuestion) {
      setAnswerResult(null)
    }
  }, [currentQuestion, lastAnsweredQuestion])

  if (!session || !me) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-5xl float">⏳</div>
        </div>
      </div>
    )
  }

  if (session.status === 'lobby') {
    return (
      <WaitingRoom
        sessionId={sessionId}
        playerId={playerId}
        nickname={me.nickname}
      />
    )
  }

  if (session.status === 'results' || session.status === 'finished') {
    return <ScoreView sessionId={sessionId} playerId={playerId} quizId={session.quiz_id} nickname={me.nickname} />
  }

  if (session.status === 'playing' && currentQuestion >= 0) {
    if (questions.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-5xl mb-4 float">⚡</div>
            <p className="text-gray-500 font-semibold">Quiz laden…</p>
          </div>
        </div>
      )
    }

    const currentQ = questions[currentQuestion]

    if (answerResult !== null && lastAnsweredQuestion === currentQuestion) {
      return (
        <AnswerFeedback
          isCorrect={answerResult.isCorrect}
          pointsEarned={answerResult.pointsEarned}
          selectedAnswer={answerResult.answer}
          question={currentQ}
          totalScore={me.score}
          streak={streak}
        />
      )
    }

    return (
      <QuestionView
        sessionId={sessionId}
        playerId={playerId}
        questionIndex={currentQuestion}
        question={currentQ}
        totalQuestions={questions.length}
        questionStartedAt={session.question_started_at ?? new Date().toISOString()}
        onAnswered={handleAnswered}
        alreadyAnswered={alreadyAnswered}
      />
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-5xl float">⏳</div>
        <p className="text-gray-500 mt-4 font-semibold">Even geduld…</p>
      </div>
    </div>
  )
}
