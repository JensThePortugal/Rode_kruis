'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useGameStore } from '@/store/gameStore'
import type { GameAnswer } from '@/types/game'

export function useAnswers(sessionId: string) {
  const { answers, setAnswers, addAnswer } = useGameStore()

  useEffect(() => {
    const supabase = createClient()

    supabase
      .from('game_answers')
      .select('*')
      .eq('session_id', sessionId)
      .then(({ data }) => { if (data) setAnswers(data as GameAnswer[]) })

    const channel = supabase
      .channel(`answers:${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'game_answers', filter: `session_id=eq.${sessionId}` },
        (payload) => addAnswer(payload.new as GameAnswer)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [sessionId, setAnswers, addAnswer])

  return answers
}
