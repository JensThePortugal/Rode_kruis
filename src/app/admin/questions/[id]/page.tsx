import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { QuestionEditForm } from './QuestionEditForm'
import type { Question } from '@/types/game'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditQuestionPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('trainer_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: question } = await supabase
    .from('questions')
    .select('*')
    .eq('id', id)
    .single()

  if (!question) redirect('/admin/questions')

  return (
    <main className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
      <Link href="/admin/questions" className="text-sm text-gray-400 font-semibold hover:text-hok-orange transition-colors mb-6 inline-block">
        ← Terug naar vragen
      </Link>
      <h1 className="text-3xl font-black text-hok-navy mb-2">Vraag bewerken</h1>
      <p className="text-gray-400 text-sm mb-8">
        Wijzigingen zijn direct actief voor alle nieuwe sessies.
      </p>
      <QuestionEditForm question={question as Question} />
    </main>
  )
}
