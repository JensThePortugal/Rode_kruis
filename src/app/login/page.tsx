'use client'

import { useState } from 'react'
import { loginWithMagicLink } from '@/lib/game/actions'

export default function LoginPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    setEmail(formData.get('email') as string)
    const result = await loginWithMagicLink(formData)
    setLoading(false)
    if ('error' in result) {
      setError(result.error ?? 'Er is iets misgegaan.')
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center bounce-in">
          <div className="text-6xl mb-6">📬</div>
          <h2 className="text-2xl font-black text-hok-navy mb-3">Check je inbox!</h2>
          <p className="text-gray-500 leading-relaxed">
            We hebben een inloglink gestuurd naar<br />
            <strong className="text-hok-navy">{email}</strong>
          </p>
          <p className="mt-4 text-sm text-gray-400">
            Geen mail? Check je spam of{' '}
            <button
              onClick={() => setSent(false)}
              className="text-hok-orange font-semibold underline underline-offset-2"
            >
              probeer opnieuw
            </button>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md">
        {/* Logo area */}
        <div className="text-center mb-8 slide-up">
          <div className="text-5xl mb-3">🏥</div>
          <h1 className="text-3xl font-black text-hok-navy mb-1">Trainer inloggen</h1>
          <p className="text-gray-500 text-sm">
            Je ontvangt een magische inloglink per e-mail — geen wachtwoord nodig.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 slide-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="full_name" className="block text-sm font-bold text-hok-navy mb-2">
                Jouw naam
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                placeholder="Jan de Vries"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-hok-orange focus:outline-none text-gray-800 font-medium transition-colors placeholder:text-gray-300"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-hok-navy mb-2">
                E-mailadres
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="jouw@email.nl"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-hok-orange focus:outline-none text-gray-800 font-medium transition-colors placeholder:text-gray-300"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-hok-orange hover:bg-hok-orange-dark disabled:opacity-60 text-white font-black text-lg py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Versturen…
                </span>
              ) : (
                'Stuur inloglink →'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <a href="/play" className="text-sm text-gray-400 hover:text-hok-orange transition-colors">
              Wil je meedoen als speler? <span className="font-semibold">Klik hier</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
