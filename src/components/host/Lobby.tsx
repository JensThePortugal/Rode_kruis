'use client'

import QRCode from 'react-qr-code'
import { usePlayers } from '@/hooks/usePlayers'
import { advanceGame } from '@/lib/game/actions'
import { useTransition } from 'react'

interface LobbyProps {
  sessionId: string
  joinCode: string
  joinUrl: string
}

export function Lobby({ sessionId, joinCode, joinUrl }: LobbyProps) {
  const players = usePlayers(sessionId)
  const [pending, startTransition] = useTransition()

  function handleStart() {
    startTransition(async () => {
      await advanceGame(sessionId, 'next')
    })
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-between min-h-screen px-4 py-8 max-w-4xl mx-auto w-full">
      {/* Top bar */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-400 pulse-glow" />
          <span className="text-sm font-semibold text-gray-500">Lobby actief</span>
        </div>
        <span className="text-sm font-semibold text-gray-400">{players.length} speler{players.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row gap-10 items-center justify-center w-full my-8">
        {/* Join code & QR */}
        <div className="text-center">
          <p className="text-gray-500 text-sm font-semibold mb-2 uppercase tracking-widest">Join-code</p>
          <div className="bg-hok-navy rounded-3xl px-10 py-6 mb-6 inline-block">
            <span className="text-7xl font-black tracking-widest text-white font-mono">
              {joinCode}
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-lg inline-block">
            <QRCode value={joinUrl} size={160} fgColor="#003366" />
          </div>
          <p className="text-xs text-gray-400 mt-2">Scan of ga naar <strong>{joinUrl.replace('https://', '')}</strong></p>
        </div>

        {/* Players list */}
        <div className="w-full max-w-sm">
          <h2 className="text-lg font-black text-hok-navy mb-4">
            Aangemelde spelers {players.length > 0 && (
              <span className="text-hok-orange">({players.length})</span>
            )}
          </h2>

          {players.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
              <div className="text-4xl mb-3 float">👀</div>
              <p className="text-gray-400 text-sm font-medium">Wachten op spelers…</p>
              <p className="text-gray-300 text-xs mt-1">Deel de code of QR-code</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {players.map((player, i) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm bounce-in"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="w-8 h-8 rounded-full bg-hok-orange/20 flex items-center justify-center text-hok-orange font-black text-sm flex-shrink-0">
                    {player.nickname.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-hok-navy text-sm truncate">{player.nickname}</span>
                  <span className="ml-auto text-green-400 text-xs font-semibold">✓</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={players.length === 0 || pending}
        className="w-full max-w-md bg-hok-orange hover:bg-hok-orange-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xl py-5 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-hok-orange/30"
      >
        {pending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Starten…
          </span>
        ) : (
          `Quiz starten${players.length > 0 ? ` (${players.length} spelers)` : ''} →`
        )}
      </button>
    </div>
  )
}
