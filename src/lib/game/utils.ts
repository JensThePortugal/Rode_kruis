import type { Level, PlayerBadge } from '@/types/game'

export function generateJoinCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function calculateScore(responseTimeMs: number, timeLimitSeconds: number): number {
  return Math.max(100, Math.floor(1000 * (1 - responseTimeMs / (timeLimitSeconds * 1000))))
}

export function getLevel(score: number, maxScore: number): Level {
  const pct = maxScore > 0 ? score / maxScore : 0
  if (pct >= 0.75) return { number: 3, title: 'Champion Lifesaver', emoji: '🏆', color: 'hok-orange' }
  if (pct >= 0.40) return { number: 2, title: 'Redder in nood', emoji: '🧡', color: 'hok-navy' }
  return { number: 1, title: 'Goede hulp bij ongeval', emoji: '⭐', color: 'yellow-500' }
}

export function getBadges(
  playerId: string,
  answers: Array<{ player_id: string; is_correct: boolean; response_time_ms: number; question_index: number }>,
  allAnswers: Array<{ player_id: string; is_correct: boolean; response_time_ms: number; question_index: number }>,
  totalQuestions: number
): PlayerBadge[] {
  const badges: PlayerBadge[] = []
  const myAnswers = answers.filter(a => a.player_id === playerId)

  if (myAnswers.length === totalQuestions && myAnswers.every(a => a.is_correct)) {
    badges.push({ id: 'perfect', label: 'Perfect streak', emoji: '🎯' })
  }

  const questionGroups = new Map<number, typeof allAnswers>()
  allAnswers.forEach(a => {
    const group = questionGroups.get(a.question_index) ?? []
    group.push(a)
    questionGroups.set(a.question_index, group)
  })

  let lightningCount = 0
  questionGroups.forEach((group) => {
    const myAnswer = group.find(a => a.player_id === playerId)
    if (!myAnswer) return
    const fastest = Math.min(...group.map(a => a.response_time_ms))
    if (myAnswer.response_time_ms === fastest) lightningCount++
  })
  if (lightningCount >= 3) {
    badges.push({ id: 'lightning', label: 'Bliksem', emoji: '⚡' })
  }

  return badges
}

export const ANSWER_COLORS = [
  { bg: 'bg-red-500',    hover: 'hover:bg-red-400',    border: 'border-red-600',    text: 'text-white', label: 'A' },
  { bg: 'bg-blue-500',   hover: 'hover:bg-blue-400',   border: 'border-blue-600',   text: 'text-white', label: 'B' },
  { bg: 'bg-yellow-400', hover: 'hover:bg-yellow-300', border: 'border-yellow-500', text: 'text-gray-900', label: 'C' },
  { bg: 'bg-green-500',  hover: 'hover:bg-green-400',  border: 'border-green-600',  text: 'text-white', label: 'D' },
]
