import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('trainer_profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const [{ count: questionCount }, { count: activeSessionCount }] = await Promise.all([
    supabase.from('questions').select('*', { count: 'exact', head: true }),
    supabase.from('game_sessions').select('*', { count: 'exact', head: true }).in('status', ['lobby', 'playing']),
  ])

  return (
    <main className="min-h-screen px-4 py-10 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-hok-orange/10 border border-hok-orange/20 text-hok-orange-dark font-bold text-sm px-4 py-2 rounded-full mb-4">
          <span className="w-2 h-2 rounded-full bg-hok-orange inline-block" />
          HOK Contentbeheer
        </div>
        <h1 className="text-4xl font-black text-hok-navy mb-1">Admin Dashboard</h1>
        <p className="text-gray-400 font-semibold">Welkom, {profile?.full_name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-hok-navy rounded-2xl p-6 text-white">
          <div className="text-4xl font-black">{questionCount ?? 0}</div>
          <div className="text-white/60 text-sm font-semibold mt-1">vragen in de quiz</div>
        </div>
        <div className="bg-hok-orange rounded-2xl p-6 text-white">
          <div className="text-4xl font-black">{activeSessionCount ?? 0}</div>
          <div className="text-white/80 text-sm font-semibold mt-1">actieve sessies nu</div>
        </div>
      </div>

      {/* Acties */}
      <div className="space-y-3">
        <Link
          href="/admin/questions"
          className="flex items-center justify-between bg-white rounded-2xl px-6 py-5 border border-gray-100 hover:border-hok-orange/30 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-hok-orange/10 rounded-xl flex items-center justify-center text-2xl">
              📝
            </div>
            <div>
              <p className="font-black text-hok-navy">Vragen beheren</p>
              <p className="text-sm text-gray-400">Bewerk, voeg toe of verwijder vragen als richtlijnen veranderen</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-300 group-hover:text-hok-orange transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>

        <Link
          href="/dashboard"
          className="flex items-center justify-between bg-white rounded-2xl px-6 py-5 border border-gray-100 hover:border-hok-navy/30 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-hok-navy/10 rounded-xl flex items-center justify-center text-2xl">
              🎓
            </div>
            <div>
              <p className="font-black text-hok-navy">Trainer dashboard</p>
              <p className="text-sm text-gray-400">Sessies aanmaken en trainingen geven</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-300 group-hover:text-hok-navy transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>

      <div className="mt-10 bg-hok-bg rounded-2xl p-5 border border-hok-orange/20">
        <p className="text-sm font-bold text-hok-navy mb-1">💡 Admin tip</p>
        <p className="text-sm text-gray-500">
          Als EHBO-richtlijnen veranderen in een nieuwe druk van het boekje, ga dan naar &quot;Vragen beheren&quot; en
          pas de vraag direct aan. Alle toekomstige sessies gebruiken automatisch de nieuwe versie.
        </p>
      </div>
    </main>
  )
}
