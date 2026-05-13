'use client'

import { create } from 'zustand'
import type { GameSession, GamePlayer, GameAnswer } from '@/types/game'

interface GameState {
  session: GameSession | null
  players: GamePlayer[]
  answers: GameAnswer[]
  setSession: (session: GameSession | null) => void
  setPlayers: (players: GamePlayer[]) => void
  setAnswers: (answers: GameAnswer[]) => void
  addAnswer: (answer: GameAnswer) => void
  reset: () => void
}

export const useGameStore = create<GameState>((set) => ({
  session: null,
  players: [],
  answers: [],
  setSession: (session) => set({ session }),
  setPlayers: (players) => set({ players }),
  setAnswers: (answers) => set({ answers }),
  addAnswer: (answer) =>
    set((state) => ({
      answers: [...state.answers.filter(
        a => !(a.player_id === answer.player_id && a.question_index === answer.question_index)
      ), answer],
    })),
  reset: () => set({ session: null, players: [], answers: [] }),
}))
