'use client'

import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { useGameStore } from '@/store/gameStore'
import {
  earnSessionXP,
  getLevelForXP,
  xpProgress,
  loadProgress,
  saveProgress,
  type EarnResult,
} from '@/lib/game/playerProgress'

interface XPSummaryProps {
  playerId: string
  nickname: string
  totalQuestions: number
}

export function XPSummary({ playerId, nickname, totalQuestions }: XPSummaryProps) {
  const { answers } = useGameStore()
  const [result, setResult] = useState<EarnResult | null>(null)
  const [barPct, setBarPct] = useState(0)
  const saved = useRef(false)

  useEffect(() => {
    if (saved.current) return
    saved.current = true

    const myAnswers = answers.filter(a => a.player_id === playerId)
    const correctAnswers = myAnswers.filter(a => a.is_correct).length
    const progress = loadProgress()

    const r = earnSessionXP({
      correctAnswers,
      totalQuestions,
      progress,
      nickname,
    })

    saveProgress(r.newProgress)
    setResult(r)

    // Animate bar after slight delay
    setTimeout(() => {
      const prog = xpProgress(r.newProgress.totalXP)
      setBarPct(prog.pct)
    }, 700)

    if (r.leveledUp) {
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.25 },
          colors: ['#F47920', '#FFA959', '#003366', '#ffffff', '#22c55e'],
        })
      }, 900)
    }
  }, [playerId, nickname, answers])

  if (!result) return null

  const newLevel = getLevelForXP(result.newProgress.totalXP)
  const prog = xpProgress(result.newProgress.totalXP)

  return (
    <div className="w-full max-w-sm slide-up" style={{ animationDelay: '0.5s' }}>
      {/* XP header */}
      <div
        className="rounded-3xl p-6 mb-4 text-white text-center"
        style={{ background: 'linear-gradient(135deg, #F47920, #D4611A)' }}
      >
        {result.leveledUp && (
          <p className="text-white/80 text-xs font-black uppercase tracking-widest mb-1 bounce-in">
            🎉 LEVEL UP!
          </p>
        )}
        <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Verdiend deze sessie</p>
        <p className="text-6xl font-black">+{result.earned}</p>
        <p className="text-sm opacity-70 font-semibold">XP</p>
      </div>

      {/* Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 space-y-2.5">
        {result.breakdown.map((b, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{b.emoji} {b.label}</span>
            <span className="font-black text-hok-orange">+{b.xp}</span>
          </div>
        ))}
        <div className="border-t border-gray-100 pt-2 flex items-center justify-between text-sm font-black">
          <span className="text-gray-800">Totaal</span>
          <span className="text-hok-orange">+{result.earned} XP</span>
        </div>
      </div>

      {/* Level progress */}
      <div className="bg-hok-navy rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{newLevel.emoji}</span>
          <div>
            <p className="font-black text-base">{newLevel.title}</p>
            <p className="text-white/50 text-xs">{result.newProgress.totalXP} XP totaal</p>
          </div>
        </div>

        {prog.pct < 100 ? (
          <>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden mb-1.5">
              <div
                className="h-full bg-hok-orange rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${barPct}%` }}
              />
            </div>
            <p className="text-xs text-white/40 text-right">
              {prog.current} / {prog.needed} XP → volgend level
            </p>
          </>
        ) : (
          <p className="text-hok-orange font-black text-sm">Max level bereikt! 🏆</p>
        )}

        {result.newProgress.streak > 1 && (
          <div className="mt-4 bg-hok-orange/15 border border-hok-orange/30 rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="font-black text-sm">{result.newProgress.streak} dagen op rij!</p>
              <p className="text-white/50 text-xs">Kom morgen terug voor je bonus XP</p>
            </div>
          </div>
        )}

        {result.newProgress.streak === 1 && (
          <div className="mt-4 bg-white/5 rounded-xl px-4 py-3">
            <p className="text-white/60 text-xs">💡 Kom morgen terug voor een streak-bonus!</p>
          </div>
        )}
      </div>
    </div>
  )
}
