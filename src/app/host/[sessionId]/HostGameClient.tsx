'use client'

import { useGameSession } from '@/hooks/useGameSession'
import { Lobby } from '@/components/host/Lobby'
import { QuestionControl } from '@/components/host/QuestionControl'
import { Leaderboard } from '@/components/host/Leaderboard'
import type { GameSession } from '@/types/game'

interface Props {
  sessionId: string
  initialSession: GameSession
  joinUrl: string
}

export function HostGameClient({ sessionId, initialSession, joinUrl }: Props) {
  const session = useGameSession(sessionId, initialSession)
  const current = session ?? initialSession

  if (current.status === 'lobby') {
    return (
      <Lobby
        sessionId={sessionId}
        joinCode={current.join_code}
        joinUrl={joinUrl}
      />
    )
  }

  if (current.status === 'playing' && current.current_question >= 0) {
    return (
      <QuestionControl
        sessionId={sessionId}
        questionIndex={current.current_question}
        questionStartedAt={current.question_started_at}
      />
    )
  }

  if (current.status === 'results' || current.status === 'finished') {
    return <Leaderboard sessionId={sessionId} />
  }

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">⏳</div>
        <p className="text-gray-500 font-semibold">Laden…</p>
      </div>
    </div>
  )
}
