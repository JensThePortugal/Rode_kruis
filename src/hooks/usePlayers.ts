'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useGameStore } from '@/store/gameStore'
import type { GamePlayer } from '@/types/game'

export function usePlayers(sessionId: string) {
  const { players, setPlayers } = useGameStore()

  useEffect(() => {
    const supabase = createClient()

    supabase
      .from('game_players')
      .select('*')
      .eq('session_id', sessionId)
      .order('score', { ascending: false })
      .then(({ data }) => { if (data) setPlayers(data as GamePlayer[]) })

    const channel = supabase
      .channel(`players:${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_players', filter: `session_id=eq.${sessionId}` },
        async () => {
          const { data } = await supabase
            .from('game_players')
            .select('*')
            .eq('session_id', sessionId)
            .order('score', { ascending: false })
          if (data) setPlayers(data as GamePlayer[])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [sessionId, setPlayers])

  return players
}
