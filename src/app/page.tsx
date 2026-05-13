import Link from 'next/link'
import { ReturningPlayerBanner } from '@/components/ReturningPlayerBanner'

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-screen px-4 py-12">
      {/* Returning player banner */}
      <ReturningPlayerBanner />

      {/* Header */}
      <div className="text-center mb-12 slide-up">
        <div className="inline-flex items-center gap-2 bg-hok-orange/10 border border-hok-orange/20 text-hok-orange-dark font-semibold text-sm px-4 py-2 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-hok-orange pulse-glow inline-block" />
          Live multiplayer quiz
        </div>

        <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-4">
          <span className="gradient-text">EHBO</span>
          <br />
          <span className="text-hok-navy">Quiz</span>
        </h1>

        <p className="text-xl text-gray-500 max-w-sm mx-auto leading-relaxed">
          Leer levens redden. Speel samen. Word een{' '}
          <span className="font-bold text-hok-orange">Champion Lifesaver</span>.
        </p>
      </div>

      {/* Two big cards */}
      <div className="grid sm:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* Trainer card */}
        <Link href="/login" className="group block">
          <div className="relative overflow-hidden bg-hok-navy rounded-3xl p-8 h-full transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-hok-navy/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
            <div className="relative">
              <div className="text-5xl mb-4 float">🎓</div>
              <h2 className="text-2xl font-black text-white mb-2">Trainer</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Maak een quiz-sessie aan en leid jouw groep door de EHBO-vragen.
              </p>
              <span className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors">
                Inloggen
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </div>
          </div>
        </Link>

        {/* Player card */}
        <Link href="/play" className="group block">
          <div className="relative overflow-hidden bg-hok-orange rounded-3xl p-8 h-full transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-hok-orange/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-8 -translate-x-8" />
            <div className="relative">
              <div className="text-5xl mb-4 float" style={{ animationDelay: '0.5s' }}>🚀</div>
              <h2 className="text-2xl font-black text-white mb-2">Speler</h2>
              <p className="text-white/80 text-sm leading-relaxed mb-6">
                Join een sessie met een code en laat zien hoe goed jij bent in EHBO!
              </p>
              <span className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors">
                Meedoen
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* HOK footer */}
      <div className="mt-12 flex items-center gap-3 text-gray-400 text-sm">
        <div className="w-8 h-1 bg-gray-200 rounded-full" />
        <span>Het Oranje Kruis · EHBO Boekje 29e druk 2026</span>
        <div className="w-8 h-1 bg-gray-200 rounded-full" />
      </div>

      <div className="mt-8 flex gap-8 text-center">
        {[
          { num: '10', label: 'vragen' },
          { num: '3', label: 'levels' },
          { num: '∞', label: 'spelers' },
        ].map(({ num, label }) => (
          <div key={label}>
            <div className="text-2xl font-black text-hok-orange">{num}</div>
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</div>
          </div>
        ))}
      </div>
    </main>
  )
}
