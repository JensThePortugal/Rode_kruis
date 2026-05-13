'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { joinSession } from '@/lib/game/actions'
import { Suspense } from 'react'

function JoinForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const prefilledCode = searchParams.get('code') ?? ''

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const result = await joinSession(formData)
    setLoading(false)

    if ('error' in result) {
      setError(result.error ?? 'Er is iets misgegaan.')
      return
    }

    // Store player info in sessionStorage for use in game
    sessionStorage.setItem('playerId', result.playerId)
    sessionStorage.setItem('sessionId', result.sessionId)
    router.push(`/play/${result.sessionId}?player=${result.playerId}`)
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8 slide-up">
          <div className="text-6xl mb-4 float">🎮</div>
          <h1 className="text-3xl font-black text-hok-navy mb-2">Meedoen!</h1>
          <p className="text-gray-500 text-sm">
            Vul je bijnaam en de code in die de trainer heeft laten zien.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 slide-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="nickname" className="block text-sm font-black text-hok-navy mb-2">
                Jouw bijnaam
              </label>
              <input
                id="nickname"
                name="nickname"
                type="text"
                required
                maxLength={20}
                placeholder="SuperSaver123"
                className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-hok-orange focus:outline-none text-gray-800 font-bold text-lg transition-colors placeholder:text-gray-200 placeholder:font-normal"
              />
            </div>

            <div>
              <label htmlFor="join_code" className="block text-sm font-black text-hok-navy mb-2">
                Quiz-code
              </label>
              <input
                id="join_code"
                name="join_code"
                type="text"
                required
                maxLength={6}
                defaultValue={prefilledCode}
                placeholder="ABC123"
                className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-hok-orange focus:outline-none text-gray-800 font-black text-2xl text-center tracking-widest uppercase transition-colors font-mono"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-hok-orange hover:bg-hok-orange-dark disabled:opacity-60 text-white font-black text-xl py-5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed shadow-lg shadow-hok-orange/30"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Joinen…
                </span>
              ) : (
                'Spelen! 🚀'
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-400 hover:text-hok-navy transition-colors">
            ← Terug naar het startscherm
          </a>
        </div>
      </div>
    </main>
  )
}

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="text-4xl float">🎮</div></div>}>
      <JoinForm />
    </Suspense>
  )
}
