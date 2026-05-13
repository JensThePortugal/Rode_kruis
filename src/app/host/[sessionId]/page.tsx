import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HostGameClient } from './HostGameClient'

interface Props {
  params: Promise<{ sessionId: string }>
}

export default async function HostPage({ params }: Props) {
  const { sessionId } = await params
  const supabase = await createClient()
  const { data: session } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (!session) redirect('/dashboard')

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const joinUrl = `${siteUrl}/play?code=${session.join_code}`

  return (
    <HostGameClient
      sessionId={sessionId}
      initialSession={session}
      joinUrl={joinUrl}
    />
  )
}
