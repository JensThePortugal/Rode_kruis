'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { ANSWER_COLORS } from '@/lib/game/utils'
import { VideoClip } from './VideoClip'
import type { Question } from '@/types/game'

interface AnswerFeedbackProps {
  isCorrect: boolean
  pointsEarned: number
  selectedAnswer: number
  question: Question | undefined
  totalScore: number
  streak?: number
}

export function AnswerFeedback({
  isCorrect,
  pointsEarned,
  selectedAnswer,
  question,
  totalScore,
  streak = 0,
}: AnswerFeedbackProps) {

  useEffect(() => {
    if (isCorrect) {
      // First burst
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.3 },
        colors: ['#F47920', '#FFA959', '#003366', '#ffffff', '#22c55e', '#FFD700'],
        startVelocity: 45,
        gravity: 0.9,
      })
      // Second burst from the sides
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.5 },
          colors: ['#F47920', '#FFA959', '#ffffff'],
        })
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.5 },
          colors: ['#F47920', '#FFA959', '#ffffff'],
        })
      }, 200)
    }
  }, [isCorrect])

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Hero banner — full top */}
      <div
        className={`relative flex flex-col items-center justify-center px-6 py-10 text-white overflow-hidden ${
          isCorrect
            ? 'bg-gradient-to-b from-green-500 to-green-600'
            : 'bg-gradient-to-b from-hok-navy to-[#001f44]'
        }`}
      >
        {/* Background shimmer */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Big result icon */}
        <div className={`text-8xl mb-3 relative z-10 ${isCorrect ? 'bounce-in' : 'shake'}`}>
          {isCorrect ? '✅' : '❌'}
        </div>

        {/* Result title */}
        <h2
          className="text-4xl font-black text-white mb-4 relative z-10 bounce-in drop-shadow-lg"
          style={{ animationDelay: '0.1s' }}
        >
          {isCorrect ? 'GOED ZO!' : 'HELAAS...'}
        </h2>

        {/* Points earned — score-fly animation */}
        {isCorrect && pointsEarned > 0 && (
          <div className="relative z-10 flex items-center justify-center">
            <div className="score-fly text-center">
              <span className="text-5xl font-black text-white drop-shadow-lg">
                +{pointsEarned}
              </span>
              <span className="block text-green-100 text-sm font-bold uppercase tracking-widest mt-1">
                punten
              </span>
            </div>
          </div>
        )}

        {/* Streak badge */}
        {streak >= 3 && (
          <div
            className="relative z-10 mt-4 flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-5 py-2 bounce-in"
            style={{ animationDelay: '0.3s' }}
          >
            <span className="text-2xl flame">🔥</span>
            <span className="text-white font-black text-lg">{streak}x OP RIJ!</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col items-center px-4 py-6 gap-4 bg-hok-bg flex-1">

        {/* Total score card */}
        <div
          className="bg-white rounded-2xl px-8 py-5 shadow-md border border-gray-100 text-center w-full max-w-sm slide-up"
          style={{ animationDelay: '0.2s' }}
        >
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Totaalscore</p>
          <p className="text-4xl font-black text-hok-navy">{totalScore}</p>
          <p className="text-xs text-gray-400 font-semibold">punten</p>
        </div>

        {/* Correct answer card (only when wrong) */}
        {!isCorrect && question && (
          <div
            className="bg-green-50 border-2 border-green-300 rounded-2xl p-5 w-full max-w-sm slide-up"
            style={{ animationDelay: '0.25s' }}
          >
            <p className="text-xs font-black text-green-700 uppercase tracking-widest mb-3">
              Goed antwoord
            </p>
            <div className="flex items-center gap-3">
              <span
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0 ${ANSWER_COLORS[question.correct_answer].bg}`}
              >
                {ANSWER_COLORS[question.correct_answer].label}
              </span>
              <span className="text-green-800 font-bold text-sm leading-snug">
                {question.options[question.correct_answer]}
              </span>
            </div>
          </div>
        )}

        {/* Explanation */}
        {question?.explanation && (
          <div
            className="bg-white border border-hok-navy/10 rounded-2xl p-5 w-full max-w-sm slide-up"
            style={{ animationDelay: '0.35s' }}
          >
            <p className="text-xs font-black text-hok-navy uppercase tracking-widest mb-2">
              Uitleg
            </p>
            <p className="text-hok-navy/80 text-sm leading-relaxed">{question.explanation}</p>
          </div>
        )}

        {/* Video clip */}
        {question && (
          <div className="w-full max-w-xs slide-up" style={{ animationDelay: '0.45s' }}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">
              Bekijk de uitleg
            </p>
            <VideoClip
              topic={question.video_topic ?? question.question}
              videoUrl={question.video_url ?? undefined}
            />
          </div>
        )}

        {/* Waiting indicator */}
        <p className="mt-2 mb-6 text-gray-400 text-sm animate-pulse font-medium">
          Wacht op de volgende vraag…
        </p>
      </div>
    </div>
  )
}
