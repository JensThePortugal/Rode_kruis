import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAdminQuestions } from '@/lib/game/actions'
import { ANSWER_COLORS } from '@/lib/game/utils'
import type { Question } from '@/types/game'

export default async function AdminQuestionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('trainer_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const questions = await getAdminQuestions()

  return (
    <main className="min-h-screen px-4 py-10 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-sm text-gray-400 font-semibold hover:text-hok-orange transition-colors mb-2 inline-block">
            ← Admin dashboard
          </Link>
          <h1 className="text-3xl font-black text-hok-navy">Vragen beheren</h1>
          <p className="text-gray-400 text-sm mt-1">{questions.length} vragen · HOK EHBO Quiz 29e druk 2026</p>
        </div>
        <Link
          href="/admin/questions/new"
          className="bg-hok-orange text-white font-black text-sm px-5 py-3 rounded-xl hover:bg-hok-orange-dark transition-colors"
        >
          + Vraag toevoegen
        </Link>
      </div>

      {/* Question list */}
      <div className="space-y-4">
        {questions.map((q: Question, i: number) => (
          <div key={q.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            {/* Question header */}
            <div className="bg-hok-navy px-5 py-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className="bg-white/20 text-white text-xs font-black px-2 py-1 rounded-lg shrink-0 mt-0.5">
                  #{i + 1}
                </span>
                <p className="text-white font-bold text-sm leading-snug">{q.question}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="bg-white/10 text-white/60 text-xs px-2 py-1 rounded-lg">
                  {q.time_limit}s
                </span>
                {q.video_url && (
                  <span className="bg-hok-orange/30 text-hok-orange text-xs px-2 py-1 rounded-lg">
                    📹 video
                  </span>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-2 p-4">
              {(q.options as string[]).map((option: string, idx: number) => {
                const color = ANSWER_COLORS[idx]
                const isCorrect = idx === q.correct_answer
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${
                      isCorrect
                        ? 'bg-green-50 border-2 border-green-300 text-green-700'
                        : 'bg-gray-50 border border-gray-200 text-gray-500'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0 ${color.bg}`}>
                      {color.label}
                    </span>
                    <span className="truncate">{option}</span>
                    {isCorrect && <span className="ml-auto shrink-0">✓</span>}
                  </div>
                )
              })}
            </div>

            {/* Footer with edit */}
            <div className="px-4 pb-4 flex items-center justify-between">
              {q.explanation && (
                <p className="text-xs text-gray-400 truncate flex-1 mr-4">
                  💡 {q.explanation}
                </p>
              )}
              <Link
                href={`/admin/questions/${q.id}`}
                className="shrink-0 bg-hok-orange/10 text-hok-orange font-black text-xs px-4 py-2 rounded-xl hover:bg-hok-orange hover:text-white transition-all"
              >
                Bewerken
              </Link>
            </div>
          </div>
        ))}
      </div>

      {questions.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-400 font-semibold">Geen vragen gevonden.</p>
          <p className="text-gray-300 text-sm mt-1">Voer eerst de database migration uit in Supabase.</p>
        </div>
      )}
    </main>
  )
}
