'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { usePlayers } from '@/hooks/usePlayers'
import { useQuestions } from '@/hooks/useQuestions'
import { getLevel, getBadges } from '@/lib/game/utils'
import { useGameStore } from '@/store/gameStore'
import { XPSummary } from './XPSummary'

interface ScoreViewProps {
  sessionId: string
  playerId: string
  quizId: string
  nickname?: string
}

export function ScoreView({ sessionId, playerId, quizId, nickname = '' }: ScoreViewProps) {
  const players = usePlayers(sessionId)
  const questions = useQuestions(quizId)
  const { answers } = useGameStore()

  const me = players.find(p => p.id === playerId)
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const myRank = sorted.findIndex(p => p.id === playerId) + 1

  const totalQuestions = questions.length || 10
  const maxScore = totalQuestions * 1000
  const level = me ? getLevel(me.score, maxScore) : null
  const badges = me
    ? getBadges(playerId, answers, answers, totalQuestions)
    : []

  useEffect(() => {
    if (myRank === 1) {
      const duration = 5000
      const end = Date.now() + duration
      const colors = ['#F47920', '#003366', '#FFA959', '#ffffff', '#22c55e']
      function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors })
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()
    }
  }, [myRank])

  return (
    <div className="flex-1 flex flex-col items-center min-h-screen px-4 py-10">
      {/* Title */}
      <div className="text-center mb-8 bounce-in">
        <div className="text-6xl mb-3">🎉</div>
        <h1 className="text-3xl font-black text-hok-navy">Quiz voltooid!</h1>
      </div>

      {/* Level card */}
      {level && me && (
        <div className={`bg-hok-orange rounded-3xl p-8 w-full max-w-sm text-center mb-6 bounce-in`}
             style={{ animationDelay: '0.1s' }}>
          <div className="text-6xl mb-3">{level.emoji}</div>
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Jouw level</p>
          <h2 className="text-2xl font-black text-white mb-3">{level.title}</h2>
          <div className="bg-white/20 rounded-xl px-4 py-2 inline-block">
            <span className="text-white font-black text-2xl">{me.score}</span>
            <span className="text-white/70 text-sm font-semibold ml-1">punten</span>
          </div>
        </div>
      )}

      {/* Rank */}
      <div className="bg-white rounded-2xl px-6 py-5 shadow-sm border border-gray-100 w-full max-w-sm mb-6 slide-up"
           style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 font-semibold">Jouw positie</p>
            <p className="text-4xl font-black text-hok-navy">#{myRank}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400 font-semibold">Van totaal</p>
            <p className="text-4xl font-black text-gray-300">{players.length}</p>
          </div>
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="w-full max-w-sm mb-6 slide-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-sm font-black text-hok-navy mb-3 uppercase tracking-wider">Jouw badges</h3>
          <div className="flex gap-3 flex-wrap">
            {badges.map(badge => (
              <div key={badge.id} className="bg-hok-navy rounded-xl px-4 py-3 flex items-center gap-2 bounce-in">
                <span className="text-xl">{badge.emoji}</span>
                <span className="text-white font-bold text-sm">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* XP + streak */}
      <XPSummary playerId={playerId} nickname={nickname} totalQuestions={totalQuestions} />

      {/* Level legend */}
      <div className="w-full max-w-sm mt-6 slide-up" style={{ animationDelay: '0.6s' }}>
        <h3 className="text-sm font-black text-gray-400 mb-3 uppercase tracking-wider">Levels</h3>
        <div className="space-y-2">
          {[
            { emoji: '⭐', title: 'Goede hulp bij ongeval', range: '< 40%', active: level?.number === 1 },
            { emoji: '🧡', title: 'Redder in nood', range: '40–75%', active: level?.number === 2 },
            { emoji: '🏆', title: 'Champion Lifesaver', range: '> 75%', active: level?.number === 3 },
          ].map((l, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
                l.active
                  ? 'bg-hok-orange/10 border-hok-orange/30'
                  : 'bg-white border-gray-100'
              }`}
            >
              <span className="text-xl">{l.emoji}</span>
              <div className="flex-1">
                <p className={`text-sm font-bold ${l.active ? 'text-hok-orange' : 'text-gray-500'}`}>{l.title}</p>
              </div>
              {l.active && <span className="text-hok-orange text-xs font-black">JIJ</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
