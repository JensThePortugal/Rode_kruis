'use client'

import { useEffect, useState } from 'react'
import { loadProgress, getLevelForXP, type PlayerProgress } from '@/lib/game/playerProgress'

export function ReturningPlayerBanner() {
  const [progress, setProgress] = useState<PlayerProgress | null>(null)

  useEffect(() => {
    const p = loadProgress()
    if (p.sessionCount > 0) setProgress(p)
  }, [])

  if (!progress) return null

  const level = getLevelForXP(progress.totalXP)
  const today = new Date().toISOString().slice(0, 10)
  const playedToday = progress.lastPlayed === today

  return (
    <div className="w-full max-w-2xl px-4 mb-6 slide-up">
      <div className="bg-hok-navy rounded-2xl px-5 py-4 flex items-center gap-4">
        <span className="text-3xl shrink-0">{level.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-white font-black text-sm truncate">
            {progress.nickname ? `Welkom terug, ${progress.nickname}!` : 'Welkom terug!'}
          </p>
          <p className="text-white/50 text-xs">
            {level.title} · {progress.totalXP} XP
            {progress.streak > 1 ? ` · 🔥 ${progress.streak} dagen` : ''}
          </p>
        </div>
        {!playedToday ? (
          <span className="shrink-0 bg-hok-orange/20 text-hok-orange text-xs font-black px-3 py-1.5 rounded-full border border-hok-orange/30 whitespace-nowrap">
            Speel vandaag!
          </span>
        ) : (
          <span className="shrink-0 bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
            ✓ Gespeeld
          </span>
        )}
      </div>
    </div>
  )
}
