'use client'

import { useEffect, useRef, useState } from 'react'
import { usePlayers } from '@/hooks/usePlayers'
import { HOKLogo } from '@/components/HOKLogo'

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
  const [pulse, setPulse] = useState(false)
  const prevCountRef = useRef(players.length)

  // Pulse player count when a new player joins
  useEffect(() => {
    if (players.length !== prevCountRef.current) {
      setPulse(true)
      prevCountRef.current = players.length
    }
    const t = setTimeout(() => setPulse(false), 600)
    return () => clearTimeout(t)
  }, [players.length])

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
    <div className="flex-1 flex flex-col min-h-screen" style={{ background: 'linear-gradient(180deg, #003366 0%, #001f44 100%)' }}>

      {/* Top brand bar */}
      <div className="flex items-center justify-center gap-2 pt-10 pb-6">
        <HOKLogo size={28} className="text-hok-orange" />
        <span className="text-white/60 text-sm font-black uppercase tracking-widest">Het Oranje Kruis</span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 gap-6">

        {/* Animated HOK cross — big center piece */}
        <div className="relative mb-2">
          <div className="absolute inset-0 rounded-full bg-hok-orange/10 scale-[3] animate-pulse" />
          <div className="absolute inset-0 rounded-full bg-hok-orange/5 scale-[2] animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="w-24 h-24 rounded-full bg-hok-orange/20 border border-hok-orange/30 flex items-center justify-center relative">
            <HOKLogo size={52} className="text-hok-orange cross-in" />
          </div>
        </div>

        {/* Get ready text */}
        <div className="text-center">
          <h1 className="text-4xl font-black text-white mb-1 tracking-tight">MAAK JE KLAAR!</h1>
          <p className="text-hok-orange/80 font-bold text-sm uppercase tracking-widest">De quiz begint zo…</p>
        </div>

        {/* Player badge */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-4 text-center bounce-in">
          <p className="text-white/50 text-xs font-black uppercase tracking-widest mb-1">Jij speelt als</p>
          <p className="text-white font-black text-2xl">{nickname}</p>
        </div>

        {/* Live player count */}
        <div className={`flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-3 transition-all ${pulse ? 'scale-110 border-green-400/50' : ''}`}>
          <span className="w-3 h-3 rounded-full bg-green-400 pulse-glow shrink-0" />
          <p className="font-black text-white text-xl">{players.length}</p>
          <p className="text-white/50 font-semibold text-sm">speler{players.length !== 1 ? 's' : ''} klaar</p>
        </div>

        {/* Animated waiting dots */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-hok-orange"
                style={{ animation: `float 1s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
          <p className="text-white/40 text-xs font-semibold">Wacht op de trainer…</p>
        </div>

        {/* Tip card */}
        <div
          className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-3xl p-5 max-w-sm w-full transition-opacity duration-300"
          style={{ opacity: tipVisible ? 1 : 0 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <HOKLogo size={12} className="text-hok-orange" />
            <p className="text-xs font-black text-hok-orange uppercase tracking-widest">Weet jij dit al?</p>
          </div>
          <div className="flex items-start gap-4">
            <span className="text-3xl shrink-0">{tip.emoji}</span>
            <p className="text-white/80 font-semibold text-sm leading-snug">{tip.text}</p>
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
    </div>
  )
}
