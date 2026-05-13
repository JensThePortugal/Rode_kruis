'use client'

import { useState, useEffect, useTransition } from 'react'
import { useAnswers } from '@/hooks/useAnswers'
import { usePlayers } from '@/hooks/usePlayers'
import { advanceGame } from '@/lib/game/actions'
import { ANSWER_COLORS } from '@/lib/game/utils'
import type { Question } from '@/types/game'

interface QuestionControlProps {
  sessionId: string
  questionIndex: number
  questionStartedAt: string | null
  questions: Question[]
}

export function QuestionControl({ sessionId, questionIndex, questionStartedAt, questions }: QuestionControlProps) {
  const answers = useAnswers(sessionId)
  const players = usePlayers(sessionId)
  const [timeLeft, setTimeLeft] = useState<number>(20)
  const [showResults, setShowResults] = useState(false)
  const [pending, startTransition] = useTransition()

  const question = questions[questionIndex]
  const timeLimit = question?.time_limit ?? 20
  const isLastQuestion = questionIndex === questions.length - 1

  const currentAnswers = answers.filter(a => a.question_index === questionIndex)
  const answerCounts = question?.options.map((_, i) =>
    currentAnswers.filter(a => a.answer === i).length
  ) ?? []
  const totalAnswered = currentAnswers.length
  const answeredCorrectly = currentAnswers.filter(a => a.is_correct).length

  useEffect(() => {
    if (!questionStartedAt) return
    setShowResults(false)

    const interval = setInterval(() => {
      const elapsed = (Date.now() - new Date(questionStartedAt).getTime()) / 1000
      const remaining = Math.max(0, timeLimit - elapsed)
      setTimeLeft(Math.ceil(remaining))
      if (remaining <= 0) {
        setShowResults(true)
        clearInterval(interval)
      }
    }, 200)

    return () => clearInterval(interval)
  }, [questionStartedAt, timeLimit])

  function handleNext() {
    startTransition(async () => {
      await advanceGame(sessionId, 'next')
    })
  }

  function handleFinish() {
    startTransition(async () => {
      await advanceGame(sessionId, 'finish')
    })
  }

  const progress = (timeLimit - timeLeft) / timeLimit
  const circumference = 2 * Math.PI * 45
  const offset = circumference * progress

  return (
    <div className="flex-1 flex flex-col min-h-screen px-4 py-8 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="bg-hok-navy text-white text-sm font-black px-4 py-2 rounded-full">
          Vraag {questionIndex + 1} / {questions.length || '…'}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{totalAnswered}/{players.length} geantwoord</span>
          {/* Countdown ring */}
          <div className="relative w-14 h-14">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="45" fill="none"
                stroke={timeLeft > 10 ? '#F47920' : timeLeft > 5 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 0.2s linear, stroke 0.3s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-lg font-black ${timeLeft <= 5 ? 'text-red-500' : 'text-hok-navy'}`}>
                {timeLeft}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-hok-navy rounded-3xl p-8 mb-6 text-white">
        <p className="text-xl sm:text-2xl font-black leading-tight">{question?.question}</p>
      </div>

      {/* Answer distribution */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {question?.options.map((option, i) => {
          const color = ANSWER_COLORS[i]
          const count = answerCounts[i] ?? 0
          const pct = totalAnswered > 0 ? Math.round((count / totalAnswered) * 100) : 0
          const isCorrect = i === question.correct_answer

          return (
            <div
              key={i}
              className={`relative overflow-hidden rounded-2xl p-4 border-2 ${
                showResults
                  ? isCorrect
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                  : `border-transparent ${color.bg} opacity-90`
              }`}
            >
              {showResults && (
                <div
                  className="absolute left-0 top-0 h-full bg-green-200/40 transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              )}
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                    showResults ? (isCorrect ? 'bg-green-400 text-white' : 'bg-gray-300 text-gray-600') : 'bg-white/20 text-white'
                  }`}>
                    {color.label}
                  </span>
                  <span className={`text-sm font-bold truncate ${showResults ? (isCorrect ? 'text-green-700' : 'text-gray-500') : 'text-white'}`}>
                    {option}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {showResults && isCorrect && <span className="text-green-500">✓</span>}
                  <span className={`text-sm font-black ${showResults ? (isCorrect ? 'text-green-600' : 'text-gray-400') : 'text-white'}`}>
                    {count}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Results summary */}
      {showResults && (
        <div className="bg-white rounded-2xl p-5 mb-6 border border-gray-100 slide-up">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <div className="text-3xl font-black text-green-500">{answeredCorrectly}</div>
              <div className="text-xs text-gray-400 font-semibold">correct</div>
            </div>
            <div className="w-px h-10 bg-gray-100" />
            <div className="text-center">
              <div className="text-3xl font-black text-red-400">{totalAnswered - answeredCorrectly}</div>
              <div className="text-xs text-gray-400 font-semibold">fout</div>
            </div>
            <div className="w-px h-10 bg-gray-100" />
            <div className="text-center">
              <div className="text-3xl font-black text-gray-300">{players.length - totalAnswered}</div>
              <div className="text-xs text-gray-400 font-semibold">geen antwoord</div>
            </div>
          </div>
          {question?.explanation && (
            <div className="mt-4 bg-hok-orange/10 rounded-xl p-4 border border-hok-orange/20">
              <p className="text-sm text-hok-navy font-medium">
                <span className="font-black">💡 Uitleg: </span>{question.explanation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Next button */}
      {(showResults || totalAnswered === players.length) && (
        <button
          onClick={isLastQuestion ? handleFinish : handleNext}
          disabled={pending}
          className="w-full bg-hok-orange hover:bg-hok-orange-dark text-white font-black text-lg py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-hok-orange/20 slide-up"
        >
          {pending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Laden…
            </span>
          ) : isLastQuestion ? (
            'Eindresultaten tonen 🏆'
          ) : (
            `Volgende vraag (${questionIndex + 2}/${questions.length}) →`
          )}
        </button>
      )}
    </div>
  )
}
