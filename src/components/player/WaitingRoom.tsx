'use client'

import { useEffect, useState } from 'react'
import { usePlayers } from '@/hooks/usePlayers'

interface WaitingRoomProps {
  sessionId: string
  playerId: string
  nickname: string
}

const TIPS = [
  '💡 Druk bij reanimatie het borstbeen 5–6 cm in!',
  '💡 Bel altijd 112 bij twijfel!',
  '💡 AED binnen 6 minuten = grote kans op overleven.',
  '💡 Koelen van een brandwond? 10–20 minuten lauw water!',
  '💡 Stabiele zijligging houdt de luchtweg vrij.',
]

export function WaitingRoom({ sessionId, playerId, nickname }: WaitingRoomProps) {
  const players = usePlayers(sessionId)
  const [tipIndex, setTipIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(i => (i + 1) % TIPS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-4 py-8">
      {/* Status */}
      <div className="text-center mb-10 slide-up">
        <div className="text-7xl mb-6 float">⏳</div>
        <h1 className="text-3xl font-black text-hok-navy mb-2">
          Je bent binnen! 🎉
        </h1>
        <p className="text-gray-500">
          Wacht tot de trainer de quiz start.
        </p>
      </div>

      {/* Player badge */}
      <div className="bg-hok-orange rounded-2xl px-8 py-5 mb-8 bounce-in">
        <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Jij speelt als</p>
        <p className="text-white font-black text-2xl">{nickname}</p>
      </div>

      {/* Player count */}
      <div className="bg-white rounded-2xl px-6 py-4 shadow-sm border border-gray-100 mb-8 text-center">
        <p className="text-3xl font-black text-hok-navy">{players.length}</p>
        <p className="text-sm text-gray-400 font-medium">speler{players.length !== 1 ? 's' : ''} aangemeld</p>
      </div>

      {/* Tips carousel */}
      <div className="bg-hok-navy/5 border border-hok-navy/10 rounded-2xl px-6 py-5 max-w-sm w-full text-center">
        <p className="text-hok-navy text-sm font-medium leading-relaxed transition-all duration-500" key={tipIndex}>
          {TIPS[tipIndex]}
        </p>
      </div>

      {/* Animated dots */}
      <div className="flex gap-2 mt-8">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-hok-orange/40"
            style={{ animation: `float 1.5s ease-in-out ${i * 0.3}s infinite` }}
          />
        ))}
      </div>
    </div>
  )
}
