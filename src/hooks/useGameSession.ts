'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useGameStore } from '@/store/gameStore'
import type { GameSession } from '@/types/game'

export function useGameSession(sessionId: string, initialSession?: GameSession) {
  const { session, setSession } = useGameStore()

  useEffect(() => {
    if (initialSession) setSession(initialSession)
  }, [initialSession, setSession])

  useEffect(() => {
    const supabase = createClient()

    supabase
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()
      .then(({ data }) => { if (data) setSession(data as GameSession) })

    const channel = supabase
      .channel(`session:${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_sessions', filter: `id=eq.${sessionId}` },
        (payload) => setSession(payload.new as GameSession)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [sessionId, setSession])

  return session
}
