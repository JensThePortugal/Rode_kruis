'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { HOK_QUESTIONS } from '@/lib/game/seedData'
import { ANSWER_COLORS } from '@/lib/game/utils'

interface AnswerFeedbackProps {
  isCorrect: boolean
  pointsEarned: number
  selectedAnswer: number
  questionIndex: number
  totalScore: number
}

export function AnswerFeedback({
  isCorrect,
  pointsEarned,
  selectedAnswer,
  questionIndex,
  totalScore,
}: AnswerFeedbackProps) {
  const question = HOK_QUESTIONS[questionIndex]

  useEffect(() => {
    if (isCorrect) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.4 },
        colors: ['#F47920', '#FFA959', '#003366', '#ffffff', '#22c55e'],
      })
    }
  }, [isCorrect])

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-4 py-8">
      {/* Result icon */}
      <div className={`bounce-in text-8xl mb-6 ${isCorrect ? '' : 'shake'}`}>
        {isCorrect ? '✅' : '❌'}
      </div>

      <h2 className={`text-3xl font-black mb-2 bounce-in ${isCorrect ? 'text-green-500' : 'text-red-500'}`}
          style={{ animationDelay: '0.1s' }}>
        {isCorrect ? 'Goed zo!' : 'Helaas...'}
      </h2>

      {/* Points earned */}
      {isCorrect && (
        <div className="bg-hok-orange/10 border border-hok-orange/30 rounded-2xl px-8 py-4 mb-6 text-center bounce-in"
             style={{ animationDelay: '0.2s' }}>
          <div className="text-4xl font-black text-hok-orange">+{pointsEarned}</div>
          <div className="text-sm text-hok-orange/70 font-semibold">punten</div>
        </div>
      )}

      {/* Total score */}
      <div className="bg-white rounded-2xl px-6 py-4 shadow-sm border border-gray-100 mb-6 text-center slide-up"
           style={{ animationDelay: '0.3s' }}>
        <div className="text-2xl font-black text-hok-navy">{totalScore} pts</div>
        <div className="text-xs text-gray-400 font-semibold">totaal</div>
      </div>

      {/* Correct answer indicator */}
      {!isCorrect && question && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 max-w-sm w-full mb-5 slide-up"
             style={{ animationDelay: '0.25s' }}>
          <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Goed antwoord</p>
          <div className="flex items-center gap-3">
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white ${ANSWER_COLORS[question.correct_answer].bg}`}>
              {ANSWER_COLORS[question.correct_answer].label}
            </span>
            <span className="text-green-700 font-bold text-sm">{question.options[question.correct_answer]}</span>
          </div>
        </div>
      )}

      {/* Explanation */}
      {question?.explanation && (
        <div className="bg-hok-navy/5 border border-hok-navy/10 rounded-2xl p-5 max-w-sm w-full slide-up"
             style={{ animationDelay: '0.35s' }}>
          <p className="text-xs font-bold text-hok-navy uppercase tracking-wider mb-2">💡 Uitleg</p>
          <p className="text-hok-navy/80 text-sm leading-relaxed">{question.explanation}</p>
        </div>
      )}

      <p className="mt-8 text-gray-400 text-sm animate-pulse">
        Wacht op de volgende vraag…
      </p>
    </div>
  )
}
