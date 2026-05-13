'use client'

import { useState, useEffect, useRef } from 'react'
import { submitAnswer } from '@/lib/game/actions'
import { ANSWER_COLORS } from '@/lib/game/utils'
import { HOKLogo } from '@/components/HOKLogo'
import type { Question } from '@/types/game'

interface QuestionViewProps {
  sessionId: string
  playerId: string
  questionIndex: number
  question: Question | undefined
  totalQuestions: number
  questionStartedAt: string
  onAnswered: (result: { isCorrect: boolean; pointsEarned: number; answer: number }) => void
  alreadyAnswered: boolean
}

export function QuestionView({
  sessionId,
  playerId,
  questionIndex,
  question,
  totalQuestions,
  questionStartedAt,
  onAnswered,
  alreadyAnswered,
}: QuestionViewProps) {
  const timeLimit = question?.time_limit ?? 20
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [selected, setSelected] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const startTimeRef = useRef(new Date(questionStartedAt).getTime())

  useEffect(() => {
    startTimeRef.current = new Date(questionStartedAt).getTime()
    setTimeLeft(timeLimit)
    setSelected(null)

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const remaining = Math.max(0, timeLimit - elapsed)
      setTimeLeft(Math.ceil(remaining))
      if (remaining <= 0) clearInterval(interval)
    }, 200)

    return () => clearInterval(interval)
  }, [questionStartedAt, timeLimit])

  async function handleAnswer(answerIndex: number) {
    if (selected !== null || loading || alreadyAnswered || timeLeft <= 0) return
    setSelected(answerIndex)
    setLoading(true)
    const responseTimeMs = Date.now() - startTimeRef.current
    const result = await submitAnswer(sessionId, playerId, questionIndex, answerIndex, responseTimeMs, timeLimit)
    setLoading(false)
    onAnswered({ ...result, answer: answerIndex })
  }

  const isUrgent = timeLeft <= 5 && timeLeft > 0
  const isWarning = timeLeft <= 10 && timeLeft > 5
  const circumference = 2 * Math.PI * 45
  const offset = circumference * (1 - timeLeft / timeLimit)
  const timerColor = isUrgent ? '#ef4444' : isWarning ? '#f59e0b' : '#F47920'
  const hasAnswered = selected !== null || alreadyAnswered

  // Estimated points for speed bonus display
  const estimatedPts = timeLeft > 0
    ? Math.max(100, Math.floor(1000 * (1 - ((timeLimit - timeLeft) / timeLimit))))
    : 100

  if (!question) return null

  return (
    <div className={`flex-1 flex flex-col min-h-screen transition-colors duration-300 ${isUrgent ? 'bg-red-50/60' : 'bg-hok-bg'}`}>

      {/* Sticky header */}
      <div className={`sticky top-0 z-20 backdrop-blur-md border-b px-4 py-3 transition-colors duration-300 ${
        isUrgent ? 'bg-red-50/90 border-red-200' : 'bg-white/90 border-gray-100'
      }`}>
        <div className="flex items-center justify-between max-w-lg mx-auto">

          {/* Left: brand + question number */}
          <div className="flex items-center gap-2.5">
            <HOKLogo size={20} className="text-hok-orange shrink-0" />
            <div>
              <p className={`text-xs font-black uppercase tracking-wider ${isUrgent ? 'text-red-500' : 'text-gray-400'}`}>
                Vraag {questionIndex + 1}/{totalQuestions}
              </p>
            </div>
          </div>

          {/* Right: countdown ring */}
          <div className={`relative w-14 h-14 ${isUrgent ? 'urgency' : ''}`}>
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke={isUrgent ? '#fee2e2' : '#f3f4f6'} strokeWidth="10" />
              <circle
                cx="50" cy="50" r="45" fill="none"
                stroke={timerColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 0.2s linear, stroke 0.3s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base font-black" style={{ color: timerColor }}>
                {timeLeft}
              </span>
            </div>
          </div>
        </div>

        {/* Progress segments */}
        <div className="flex gap-1 mt-2 max-w-lg mx-auto">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                i < questionIndex ? 'bg-hok-orange' :
                i === questionIndex ? (isUrgent ? 'bg-red-400' : 'bg-hok-orange/40') : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Urgency alert */}
        {isUrgent && !hasAnswered && (
          <div className="flex justify-center mt-2">
            <span className="text-red-500 font-black text-xs uppercase tracking-widest urgency">
              ⚡ SNEL!
            </span>
          </div>
        )}
      </div>

      {/* Question */}
      <div className="px-4 pt-5 pb-3 max-w-lg mx-auto w-full">
        <div className={`rounded-3xl p-6 mb-4 transition-colors duration-300 ${
          isUrgent ? 'bg-hok-navy' : 'bg-hok-navy'
        }`}>
          <div className="flex items-start gap-3">
            <span className="bg-hok-orange text-white text-xs font-black px-2.5 py-1 rounded-lg shrink-0 mt-0.5">
              V{questionIndex + 1}
            </span>
            <p className="text-white font-black text-lg leading-snug">{question.question}</p>
          </div>
        </div>

        {/* Speed bonus indicator */}
        {!hasAnswered && timeLeft > 0 && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className={`text-xs font-black px-3 py-1.5 rounded-full transition-all ${
              isUrgent
                ? 'bg-red-100 text-red-500 border border-red-200'
                : 'bg-hok-orange/10 text-hok-orange border border-hok-orange/20'
            }`}>
              ⚡ Nu antwoorden = +{estimatedPts} pts
            </span>
          </div>
        )}

        {/* Answer buttons */}
        <div className="grid grid-cols-1 gap-3">
          {question.options.map((option, i) => {
            const color = ANSWER_COLORS[i]
            const isSelected = selected === i
            const disabled = hasAnswered || timeLeft <= 0 || loading

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={disabled}
                className={`answer-btn w-full text-left rounded-2xl py-4 px-5 font-bold text-base transition-all duration-150
                  ${isSelected && loading
                    ? `${color.bg} ${color.text} border-2 border-white/40 scale-[0.98] shadow-xl`
                    : isSelected
                    ? `${color.bg} ${color.text} border-2 border-white/40 scale-[0.98] shadow-lg`
                    : hasAnswered || timeLeft <= 0
                    ? `bg-gray-100 text-gray-400 border-2 border-transparent opacity-50 cursor-not-allowed`
                    : `${color.bg} ${color.text} border-2 border-white/20 hover:scale-[1.02] hover:shadow-lg hover:border-white/40 active:scale-[0.97] cursor-pointer`
                  }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                    isSelected ? 'bg-white/30' : 'bg-white/20'
                  } ${color.text}`}>
                    {isSelected && loading ? (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : color.label}
                  </span>
                  <span className="leading-snug font-bold">{option}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Time's up */}
        {timeLeft <= 0 && !hasAnswered && (
          <div className="mt-5 text-center bg-gray-900 rounded-2xl px-6 py-5 bounce-in">
            <p className="text-white font-black text-xl">⏰ Tijd is om!</p>
            <p className="text-gray-400 text-sm mt-1">Wacht op de volgende vraag…</p>
          </div>
        )}

        {/* Sent confirmation */}
        {hasAnswered && selected !== null && !loading && (
          <div className="mt-5 text-center slide-up">
            <p className="text-gray-500 font-bold text-sm animate-pulse">
              ✓ Antwoord verstuurd — wacht op de trainer…
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
