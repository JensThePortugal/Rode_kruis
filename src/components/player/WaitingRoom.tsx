'use client'

import { useEffect, useState } from 'react'
import { usePlayers } from '@/hooks/usePlayers'

interface WaitingRoomProps {
  sessionId: string
  playerId: string
  nickname: string
}

const TIPS = [
  { emoji: '🫀', text: 'Druk bij reanimatie het borstbeen 5–6 cm in — dieper dan je denkt!' },
  { emoji: '📱', text: 'AED binnen 6 minuten = drastisch hogere overlevingskans!' },
  { emoji: '🚒', text: 'Twijfel je? Bel altijd 112. Beter te vroeg dan te laat.' },
  { emoji: '🚿', text: 'Brandwond? 10–20 minuten koel met lauw water. Geen ijs!' },
  { emoji: '🔄', text: '30 compressies, 2 beademingen — de 30:2 ritmiek van reanimatie.' },
  { emoji: '🧠', text: 'Beroerte? Mond – Spraak – Arm. Drie signalen, één actie: bel 112.' },
  { emoji: '🤿', text: 'Iemand verstikt? Eerst 5 rugslagen, dan pas buikstoten.' },
  { emoji: '💤', text: 'Bewusteloos maar ademt? Stabiele zijligging — luchtweg vrij houden!' },
]

export function WaitingRoom({ sessionId, playerId, nickname }: WaitingRoomProps) {
  const players = usePlayers(sessionId)
  const [tipIndex, setTipIndex] = useState(0)
  const [tipVisible, setTipVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setTipVisible(false)
      setTimeout(() => {
        setTipIndex(i => (i + 1) % TIPS.length)
        setTipVisible(true)
      }, 300)
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  const tip = TIPS[tipIndex]

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-4 py-8">

      {/* Player badge */}
      <div className="bg-hok-orange rounded-3xl px-10 py-6 mb-8 text-center bounce-in shadow-xl shadow-hok-orange/25">
        <p className="text-white/70 text-xs font-black uppercase tracking-widest mb-1">Jij speelt als</p>
        <p className="text-white font-black text-3xl">{nickname}</p>
      </div>

      {/* Live player count */}
      <div className="flex items-center gap-3 bg-white rounded-2xl px-6 py-4 shadow-sm border border-gray-100 mb-10">
        <span className="w-3 h-3 rounded-full bg-green-400 pulse-glow shrink-0" />
        <p className="font-black text-hok-navy text-xl">{players.length}</p>
        <p className="text-gray-400 font-semibold text-sm">speler{players.length !== 1 ? 's' : ''} aangemeld</p>
      </div>

      {/* Wacht-animatie */}
      <div className="text-center mb-8">
        <div className="flex gap-2 justify-center mb-3">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-hok-orange"
              style={{ animation: `float 1.2s ease-in-out ${i * 0.25}s infinite` }}
            />
          ))}
        </div>
        <p className="text-gray-400 font-semibold text-sm">Wacht op de trainer…</p>
      </div>

      {/* Tip card */}
      <div
        className="bg-hok-navy rounded-3xl p-6 max-w-sm w-full transition-opacity duration-300"
        style={{ opacity: tipVisible ? 1 : 0 }}
      >
        <p className="text-xs font-black text-hok-orange uppercase tracking-widest mb-3">
          Weet jij dit al?
        </p>
        <div className="flex items-start gap-4">
          <span className="text-4xl shrink-0">{tip.emoji}</span>
          <p className="text-white font-bold text-base leading-snug">{tip.text}</p>
        </div>
        <div className="flex gap-1 mt-4">
          {TIPS.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
                i === tipIndex ? 'bg-hok-orange' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
