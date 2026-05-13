import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createGameSession, signOut } from '@/lib/game/actions'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = user ? await supabase
    .from('trainer_profiles')
    .select('full_name, organisation, role')
    .eq('id', user.id)
    .single() : { data: null }

  const isAdmin = profile?.role === 'admin'

  const { data: recentSessions } = await supabase
    .from('game_sessions')
    .select('id, join_code, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const name = profile?.full_name ?? user?.email ?? 'Trainer'

  return (
    <main className="flex-1 flex flex-col min-h-screen px-4 py-8 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-sm text-gray-400 font-medium">{user ? 'Welkom terug' : 'Trainer dashboard'}</p>
          <h1 className="text-2xl font-black text-hok-navy">{user ? `${name} 👋` : 'EHBO Quiz'}</h1>
        </div>
        {user ? (
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-gray-400 hover:text-red-500 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
            >
              Uitloggen
            </button>
          </form>
        ) : (
          <Link
            href="/login"
            className="text-sm text-gray-400 hover:text-hok-navy font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
          >
            Inloggen →
          </Link>
        )}
      </div>

      {/* Create session card */}
      <div className="bg-hok-navy rounded-3xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <div className="relative">
          <div className="text-4xl mb-4">⚡</div>
          <h2 className="text-2xl font-black text-white mb-2">Nieuwe quiz starten</h2>
          <p className="text-white/60 text-sm mb-6 leading-relaxed">
            Maak een live sessie aan. Spelers joinen via de gegenereerde code of QR-code.
          </p>
          <form action={async () => {
            'use server'
            const result = await createGameSession()
            if ('sessionId' in result) {
              redirect(`/host/${result.sessionId}`)
            }
          }}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-hok-orange hover:bg-hok-orange-dark text-white font-black px-7 py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Quiz starten
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Recent sessions */}
      {recentSessions && recentSessions.length > 0 && (
        <div>
          <h2 className="text-lg font-black text-hok-navy mb-4">Recente sessies</h2>
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-2xl px-5 py-4 flex items-center justify-between border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-hok-orange/10 flex items-center justify-center">
                    <span className="text-hok-orange font-black text-sm">{session.join_code}</span>
                  </div>
                  <div>
                    <p className="font-bold text-hok-navy text-sm">Code: {session.join_code}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(session.created_at).toLocaleDateString('nl-NL', {
                        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  session.status === 'lobby'   ? 'bg-blue-100 text-blue-600' :
                  session.status === 'playing' ? 'bg-green-100 text-green-600' :
                  session.status === 'finished' ? 'bg-gray-100 text-gray-500' :
                  'bg-yellow-100 text-yellow-600'
                }`}>
                  {session.status === 'lobby'    ? 'Wachtkamer' :
                   session.status === 'playing'  ? 'Actief' :
                   session.status === 'finished' ? 'Klaar' : 'Resultaten'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin panel link — alleen zichtbaar voor HOK admins */}
      {isAdmin && (
        <Link
          href="/admin"
          className="flex items-center justify-between bg-hok-navy rounded-2xl px-5 py-4 mb-6 hover:bg-hok-navy-light transition-colors group"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚙️</span>
            <div>
              <p className="font-black text-white text-sm">HOK Contentbeheer</p>
              <p className="text-white/50 text-xs">Vragen aanpassen, video&apos;s toevoegen</p>
            </div>
          </div>
          <svg className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      )}

      {/* Info strip */}
      <div className="mt-4 bg-hok-orange/10 rounded-2xl p-5 border border-hok-orange/20">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📖</span>
          <div>
            <p className="font-bold text-hok-navy text-sm">10 officiële EHBO-vragen</p>
            <p className="text-gray-500 text-xs mt-1">
              Uit Het Oranje Kruis Boekje 29e druk (2026). Spelers verdienen punten op basis van snelheid en juistheid.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
