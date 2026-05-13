'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { usePlayers } from '@/hooks/usePlayers'
import { useQuestions } from '@/hooks/useQuestions'
import { getLevel } from '@/lib/game/utils'

interface LeaderboardProps {
  sessionId: string
  quizId: string
}

const MEDALS = ['🥇', '🥈', '🥉']

export function Leaderboard({ sessionId, quizId }: LeaderboardProps) {
  const players = usePlayers(sessionId)
  const questions = useQuestions(quizId)
  const maxScore = (questions.length || 10) * 1000
  const sorted = [...players].sort((a, b) => b.score - a.score)

  useEffect(() => {
    const duration = 4000
    const end = Date.now() + duration
    const colors = ['#F47920', '#003366', '#FFA959', '#ffffff']

    function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }

    frame()
  }, [])

  return (
    <div className="flex-1 flex flex-col items-center min-h-screen px-4 py-10 max-w-2xl mx-auto w-full">
      {/* Title */}
      <div className="text-center mb-10 bounce-in">
        <div className="text-6xl mb-3">🏆</div>
        <h1 className="text-4xl font-black text-hok-navy">Einduitslag!</h1>
        <p className="text-gray-500 mt-2">Geweldig gespeeld, iedereen!</p>
      </div>

      {/* Podium top 3 */}
      {sorted.length >= 1 && (
        <div className="flex items-end justify-center gap-4 mb-10 w-full">
          {[1, 0, 2].map((rank) => {
            const player = sorted[rank]
            if (!player) return <div key={rank} className="w-24" />
            const level = getLevel(player.score, maxScore)
            const heights = [28, 36, 20]
            return (
              <div
                key={player.id}
                className="flex flex-col items-center bounce-in"
                style={{ animationDelay: `${rank * 0.1}s` }}
              >
                <div className="text-3xl mb-1">{MEDALS[rank]}</div>
                <div className="w-16 h-16 rounded-full bg-hok-orange/20 flex items-center justify-center mb-2 border-4 border-hok-orange">
                  <span className="text-2xl font-black text-hok-orange">
                    {player.nickname.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-sm font-black text-hok-navy text-center max-w-[80px] truncate">{player.nickname}</div>
                <div className="text-xs text-hok-orange font-bold">{player.score} pts</div>
                <div
                  className={`w-24 bg-hok-navy rounded-t-xl mt-2 flex items-center justify-center`}
                  style={{ height: `${heights[rank] * 4}px` }}
                >
                  <span className="text-white font-black text-lg">{rank + 1}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Full ranking */}
      <div className="w-full space-y-2">
        {sorted.map((player, i) => {
          const level = getLevel(player.score, maxScore)
          return (
            <div
              key={player.id}
              className={`flex items-center gap-4 rounded-2xl px-5 py-4 slide-up ${
                i < 3 ? 'bg-white shadow-md border border-gray-100' : 'bg-white/60'
              }`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className={`w-8 text-center font-black ${i < 3 ? 'text-xl' : 'text-gray-300 text-sm'}`}>
                {i < 3 ? MEDALS[i] : i + 1}
              </div>
              <div className="w-10 h-10 rounded-xl bg-hok-orange/10 flex items-center justify-center flex-shrink-0">
                <span className="text-hok-orange font-black text-lg">
                  {player.nickname.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-hok-navy truncate">{player.nickname}</p>
                <p className="text-xs text-gray-400 font-medium">
                  {level.emoji} {level.title}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-black text-hok-orange text-lg">{player.score}</p>
                <p className="text-xs text-gray-400">punten</p>
              </div>
            </div>
          )
        })}
      </div>

      {sorted.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          <div className="text-4xl mb-4">🤔</div>
          <p className="font-semibold">Geen spelers gevonden</p>
        </div>
      )}
    </div>
  )
}
