'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { addQuestion } from '@/lib/game/actions'
import { ANSWER_COLORS } from '@/lib/game/utils'

export default function NewQuestionPage() {
  const router = useRouter()
  const [text, setText] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctAnswer, setCorrectAnswer] = useState(0)
  const [explanation, setExplanation] = useState('')
  const [timeLimit, setTimeLimit] = useState(20)
  const [videoTopic, setVideoTopic] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleOptionChange(idx: number, value: string) {
    setOptions(prev => prev.map((o, i) => i === idx ? value : o))
  }

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await addQuestion({
        question: text,
        options,
        correct_answer: correctAnswer,
        explanation,
        time_limit: timeLimit,
        video_topic: videoTopic,
        video_url: videoUrl,
      })
      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/admin/questions')
      }
    })
  }

  return (
    <main className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
      <Link href="/admin/questions" className="text-sm text-gray-400 font-semibold hover:text-hok-orange transition-colors mb-6 inline-block">
        ← Terug naar vragen
      </Link>
      <h1 className="text-3xl font-black text-hok-navy mb-2">Vraag toevoegen</h1>
      <p className="text-gray-400 text-sm mb-8">
        Nieuwe vraag wordt direct toegevoegd aan de HOK master quiz.
      </p>

      <div className="space-y-6">
        {/* Question text */}
        <div>
          <label className="block text-sm font-black text-hok-navy mb-2 uppercase tracking-wider">Vraag</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={3}
            className="w-full bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 text-hok-navy font-semibold text-sm focus:border-hok-orange focus:outline-none resize-none transition-colors"
            placeholder="Schrijf de vraag hier..."
          />
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-black text-hok-navy mb-2 uppercase tracking-wider">
            Antwoordopties
            <span className="text-gray-400 font-normal normal-case ml-2">— klik op een optie om het juiste antwoord te markeren</span>
          </label>
          <div className="space-y-2">
            {options.map((option, idx) => {
              const color = ANSWER_COLORS[idx]
              const isCorrect = idx === correctAnswer
              return (
                <div key={idx} className={`flex items-center gap-3 rounded-2xl border-2 p-3 transition-all cursor-pointer ${
                  isCorrect ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <button
                    type="button"
                    onClick={() => setCorrectAnswer(idx)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0 transition-all ${color.bg} ${isCorrect ? 'ring-2 ring-green-400 ring-offset-2' : ''}`}
                  >
                    {color.label}
                  </button>
                  <input
                    type="text"
                    value={option}
                    onChange={e => handleOptionChange(idx, e.target.value)}
                    className="flex-1 bg-transparent text-sm font-semibold text-hok-navy focus:outline-none placeholder:text-gray-300"
                    placeholder={`Optie ${color.label}...`}
                  />
                  {isCorrect && <span className="shrink-0 text-green-500 font-black text-sm">✓ Correct</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-black text-hok-navy mb-2 uppercase tracking-wider">Uitleg</label>
          <textarea
            value={explanation}
            onChange={e => setExplanation(e.target.value)}
            rows={2}
            className="w-full bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 text-hok-navy font-semibold text-sm focus:border-hok-orange focus:outline-none resize-none transition-colors"
            placeholder="Leg uit waarom dit het juiste antwoord is..."
          />
        </div>

        {/* Time limit */}
        <div>
          <label className="block text-sm font-black text-hok-navy mb-2 uppercase tracking-wider">Tijdslimiet</label>
          <div className="flex gap-2">
            {[10, 15, 20, 25, 30].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeLimit(t)}
                className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
                  timeLimit === t ? 'bg-hok-orange text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {t}s
              </button>
            ))}
          </div>
        </div>

        {/* Video */}
        <div className="bg-hok-navy/5 rounded-2xl p-5 space-y-3">
          <label className="block text-sm font-black text-hok-navy uppercase tracking-wider">📹 Uitlegvideo (optioneel)</label>
          <div>
            <p className="text-xs text-gray-400 font-semibold mb-1">Onderwerp / titel</p>
            <input
              type="text"
              value={videoTopic}
              onChange={e => setVideoTopic(e.target.value)}
              className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 text-hok-navy font-semibold text-sm focus:border-hok-orange focus:outline-none transition-colors"
              placeholder="bijv. Reanimatie: hoe diep druk je?"
            />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold mb-1">YouTube of HeyGen URL</p>
            <input
              type="url"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 text-hok-navy font-semibold text-sm focus:border-hok-orange focus:outline-none transition-colors"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-red-600 text-sm font-semibold">{error}</p>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={pending || !text.trim()}
          className="w-full bg-hok-orange hover:bg-hok-orange-dark text-white font-black text-base py-4 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-hok-orange/20 disabled:opacity-60"
        >
          {pending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Toevoegen…
            </span>
          ) : (
            'Vraag toevoegen & activeren'
          )}
        </button>
      </div>
    </main>
  )
}
