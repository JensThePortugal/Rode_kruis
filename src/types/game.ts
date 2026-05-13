export type SessionStatus = 'lobby' | 'playing' | 'results' | 'finished'

export interface TrainerProfile {
  id: string
  full_name: string
  organisation: string | null
  role: 'trainer' | 'admin'
  created_at: string
}

export interface Quiz {
  id: string
  trainer_id: string | null // null = globale HOK quiz
  title: string
  created_at: string
}

export interface Question {
  id: string
  quiz_id: string
  question: string
  options: string[]
  correct_answer: number
  explanation: string | null
  time_limit: number
  order_index: number
  video_topic: string | null
  video_url: string | null
  updated_at: string
}

export interface GameSession {
  id: string
  quiz_id: string
  trainer_id: string
  join_code: string
  status: SessionStatus
  current_question: number
  question_started_at: string | null
  created_at: string
}

export interface GamePlayer {
  id: string
  session_id: string
  nickname: string
  score: number
  joined_at: string
}

export interface GameAnswer {
  id: string
  session_id: string
  player_id: string
  question_index: number
  answer: number
  is_correct: boolean
  response_time_ms: number
  points_earned: number
  answered_at: string
}

export interface PlayerBadge {
  id: string
  label: string
  emoji: string
}

export type Level = {
  number: 1 | 2 | 3
  title: string
  emoji: string
  color: string
}
