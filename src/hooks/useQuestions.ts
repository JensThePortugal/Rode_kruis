'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Question } from '@/types/game'

export function useQuestions(quizId: string | null | undefined): Question[] {
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    if (!quizId) return
    const supabase = createClient()
    supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order_index')
      .then(({ data }) => {
        if (data) setQuestions(data as Question[])
      })
  }, [quizId])

  return questions
}
