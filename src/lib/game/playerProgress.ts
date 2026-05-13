const KEY = 'hok_progress'

export interface PlayerProgress {
  totalXP: number
  streak: number
  lastPlayed: string // 'YYYY-MM-DD'
  sessionCount: number
  badges: string[]
  nickname: string
}

export interface XPLevel {
  number: number
  title: string
  emoji: string
  minXP: number
  maxXP: number // 0 = highest level (no ceiling)
}

export const XP_LEVELS: XPLevel[] = [
  { number: 1, title: 'EHBO Beginner',      emoji: '🌱', minXP: 0,    maxXP: 149  },
  { number: 2, title: 'Goede Hulpverlener', emoji: '⭐', minXP: 150,  maxXP: 399  },
  { number: 3, title: 'Redder in Nood',     emoji: '🧡', minXP: 400,  maxXP: 799  },
  { number: 4, title: 'EHBO Expert',        emoji: '🔥', minXP: 800,  maxXP: 1499 },
  { number: 5, title: 'Champion Lifesaver', emoji: '🏆', minXP: 1500, maxXP: 0    },
]

function empty(): PlayerProgress {
  return { totalXP: 0, streak: 0, lastPlayed: '', sessionCount: 0, badges: [], nickname: '' }
}

export function loadProgress(): PlayerProgress {
  if (typeof window === 'undefined') return empty()
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty()
  } catch {
    return empty()
  }
}

export function saveProgress(p: PlayerProgress): void {
  localStorage.setItem(KEY, JSON.stringify(p))
}

export function getLevelForXP(xp: number): XPLevel {
  return [...XP_LEVELS].reverse().find(l => xp >= l.minXP) ?? XP_LEVELS[0]
}

export function xpProgress(xp: number): { current: number; needed: number; pct: number } {
  const lvl = getLevelForXP(xp)
  if (lvl.maxXP === 0) return { current: 0, needed: 0, pct: 100 }
  const current = xp - lvl.minXP
  const needed = lvl.maxXP - lvl.minXP + 1
  return { current, needed, pct: Math.min(100, Math.floor((current / needed) * 100)) }
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function daysBetween(a: string, b: string): number {
  if (!a) return 999
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000)
}

export interface XPBreakdown {
  emoji: string
  label: string
  xp: number
}

export interface EarnResult {
  earned: number
  breakdown: XPBreakdown[]
  newProgress: PlayerProgress
  leveledUp: boolean
}

export function earnSessionXP(params: {
  correctAnswers: number
  totalQuestions: number
  progress: PlayerProgress
  nickname: string
}): EarnResult {
  const { correctAnswers, totalQuestions, progress, nickname } = params
  const breakdown: XPBreakdown[] = []

  breakdown.push({ emoji: '🎮', label: 'Sessie gespeeld', xp: 50 })

  const correctXP = correctAnswers * 15
  if (correctXP > 0) breakdown.push({ emoji: '✅', label: `${correctAnswers} juiste antwoorden`, xp: correctXP })

  if (correctAnswers === totalQuestions) {
    breakdown.push({ emoji: '🎯', label: 'Perfect spel!', xp: 100 })
  }

  const today = todayStr()
  const days = daysBetween(progress.lastPlayed, today)
  const newStreak = days === 0 ? progress.streak : days === 1 ? progress.streak + 1 : 1

  if (newStreak > 1) {
    const streakXP = Math.min(newStreak * 10, 100)
    breakdown.push({ emoji: '🔥', label: `${newStreak}-daagse streak bonus`, xp: streakXP })
  }

  const earned = breakdown.reduce((s, b) => s + b.xp, 0)
  const oldXP = progress.totalXP
  const newXP = oldXP + earned
  const leveledUp = getLevelForXP(newXP).number > getLevelForXP(oldXP).number

  const newBadges = [...progress.badges]
  if (!newBadges.includes('first_play')) newBadges.push('first_play')
  if (correctAnswers === totalQuestions && !newBadges.includes('perfect')) newBadges.push('perfect')
  if (newStreak >= 3 && !newBadges.includes('streak_3')) newBadges.push('streak_3')
  if (newStreak >= 7 && !newBadges.includes('streak_7')) newBadges.push('streak_7')
  if (newXP >= 1500 && !newBadges.includes('champion')) newBadges.push('champion')

  return {
    earned,
    breakdown,
    leveledUp,
    newProgress: {
      totalXP: newXP,
      streak: newStreak,
      lastPlayed: today,
      sessionCount: progress.sessionCount + 1,
      badges: newBadges,
      nickname: nickname || progress.nickname,
    },
  }
}
