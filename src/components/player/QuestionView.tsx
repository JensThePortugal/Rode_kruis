'use client'

import { useState, useEffect, useRef } from 'react'
import { submitAnswer } from '@/lib/game/actions'
import { HOK_QUESTIONS } from '@/lib/game/seedData'
import { ANSWER_COLORS } from '@/lib/game/utils'

interface QuestionViewProps {
  sessionId: string
  playerId: string
  questionIndex: number
  questionStartedAt: string
  onAnswered: (result: { isCorrect: boolean; pointsEarned: number; answer: number }) => void
  alreadyAnswered: boolean
}

export function QuestionView({
  sessionId,
  playerId,
  questionIndex,
  questionStartedAt,
  onAnswered,
  alreadyAnswered,
}: QuestionViewProps) {
  const question = HOK_QUESTIONS[questionIndex]
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

    const result = await submitAnswer(
      sessionId,
      playerId,
      questionIndex,
      answerIndex,
      responseTimeMs,
      timeLimit
    )

    setLoading(false)
    onAnswered({ ...result, answer: answerIndex })
  }

  const progress = timeLeft / timeLimit
  const circumference = 2 * Math.PI * 45
  const offset = circumference * (1 - progress)
  const urgentColor = timeLeft <= 5 ? '#ef4444' : timeLeft <= 10 ? '#f59e0b' : '#F47920'

  if (!question) return null

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Progress bar + countdown */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Vraag {questionIndex + 1}/{HOK_QUESTIONS.length}
            </span>
          </div>

          {/* Countdown ring */}
          <div className="relative w-12 h-12">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="10" />
              <circle
                cx="50" cy="50" r="45" fill="none"
                stroke={urgentColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 0.2s linear, stroke 0.3s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-sm font-black"
                style={{ color: urgentColor }}
              >
                {timeLeft}
              </span>
            </div>
          </div>
        </div>

        {/* Progress segments */}
        <div className="flex gap-1 mt-2 max-w-lg mx-auto">
          {HOK_QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-colors ${
                i < questionIndex ? 'bg-hok-orange' :
                i === questionIndex ? 'bg-hok-orange/50' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="px-4 py-6 max-w-lg mx-auto w-full">
        <div className="bg-hok-navy rounded-3xl p-6 mb-6">
          <p className="text-white font-black text-xl leading-snug">{question.question}</p>
        </div>

        {/* Answer buttons */}
        <div className="grid grid-cols-1 gap-3">
          {question.options.map((option, i) => {
            const color = ANSWER_COLORS[i]
            const isSelected = selected === i
            const hasAnswered = selected !== null || alreadyAnswered
            const disabled = hasAnswered || timeLeft <= 0 || loading

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={disabled}
                className={`answer-btn w-full text-left rounded-2xl p-5 border-2 font-bold text-base transition-all
                  ${isSelected
                    ? `${color.bg} ${color.text} border-transparent scale-[0.98] shadow-lg`
                    : hasAnswered || timeLeft <= 0
                    ? `bg-gray-100 text-gray-400 border-transparent cursor-not-allowed opacity-60`
                    : `${color.bg} ${color.text} border-transparent ${color.hover} hover:scale-[1.02] hover:shadow-md active:scale-[0.97] cursor-pointer`
                  }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${
                    isSelected ? 'bg-white/30' : 'bg-white/20'
                  } ${color.text}`}>
                    {color.label}
                  </span>
                  <span className="leading-snug">{option}</span>
                </div>
              </button>
            )
          })}
        </div>

        {(timeLeft <= 0 && selected === null && !alreadyAnswered) && (
          <div className="mt-6 text-center bg-gray-100 rounded-2xl px-6 py-4">
            <p className="text-gray-500 font-bold">⏰ Tijd is om!</p>
          </div>
        )}
      </div>
    </div>
  )
}
