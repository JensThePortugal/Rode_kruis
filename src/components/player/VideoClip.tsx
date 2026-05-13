'use client'

import { HOKLogo } from '@/components/HOKLogo'

interface VideoClipProps {
  topic: string
  videoUrl?: string
}

export function VideoClip({ topic, videoUrl }: VideoClipProps) {
  const youtubeId = videoUrl
    ? videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&\n?#]+)/)?.[1]
    : null

  if (youtubeId) {
    return (
      <div className="w-full max-w-xs mx-auto slide-up">
        {/* Portrait 9:16 container for YouTube */}
        <div
          className="relative rounded-2xl overflow-hidden shadow-xl"
          style={{ aspectRatio: '9/16' }}
        >
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="bg-hok-navy rounded-b-2xl px-4 py-2.5 flex items-center justify-between">
          <p className="text-white text-xs font-bold truncate">{topic}</p>
          <p className="text-hok-orange text-xs shrink-0 ml-2">@hetoranjekruis</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-xs mx-auto slide-up">
      {/* Portrait 9:16 TikTok-style card */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-xl"
        style={{
          background: 'linear-gradient(170deg, #003366 0%, #1A4D8F 45%, #002244 100%)',
          aspectRatio: '9/16',
        }}
      >
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, #F47920 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />

        {/* Orange glow at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/3 opacity-20"
          style={{
            background: 'radial-gradient(ellipse at 50% 100%, #F47920 0%, transparent 70%)',
          }}
        />

        {/* Top: username bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4 pb-2 z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-hok-orange flex items-center justify-center">
              <HOKLogo size={16} className="text-white" />
            </div>
            <span className="text-white text-xs font-bold">@hetoranjekruis</span>
          </div>
          {/* Red live badge */}
          <span className="flex items-center gap-1 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
            BINNENKORT
          </span>
        </div>

        {/* TikTok-style right sidebar */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-5 z-10">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-xl">♥</span>
            <span className="text-white/50 text-[9px]">2.4K</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-xl">💬</span>
            <span className="text-white/50 text-[9px]">318</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-xl">↗</span>
            <span className="text-white/50 text-[9px]">Deel</span>
          </div>
        </div>

        {/* Center content: animated HOK cross + topic */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          {/* Pulsing glow ring */}
          <div className="relative mb-5">
            <div className="absolute inset-0 rounded-full bg-hok-orange/20 scale-[2.2] animate-pulse" />
            <div className="relative w-20 h-20 bg-hok-orange/15 rounded-full flex items-center justify-center border border-hok-orange/30">
              <HOKLogo size={48} className="text-hok-orange cross-in" />
            </div>
          </div>
          <p className="text-white font-black text-base leading-snug mb-3 drop-shadow-lg">{topic}</p>
          <p className="text-white/50 text-xs leading-relaxed max-w-[160px]">
            Leer meer over EHBO op ons kanaal
          </p>
        </div>

        {/* Sound wave bars at bottom */}
        <div className="absolute bottom-10 left-0 right-0 flex items-end justify-center gap-[3px] h-10 px-6 z-10">
          <div className="w-1.5 rounded-full bg-hok-orange/70 bw1" style={{ height: 4 }} />
          <div className="w-1.5 rounded-full bg-hok-orange/70 bw2" style={{ height: 10 }} />
          <div className="w-1.5 rounded-full bg-hok-orange/80 bw3" style={{ height: 6 }} />
          <div className="w-1.5 rounded-full bg-hok-orange bw4" style={{ height: 14 }} />
          <div className="w-1.5 rounded-full bg-hok-orange/80 bw5" style={{ height: 8 }} />
          <div className="w-1.5 rounded-full bg-hok-orange/70 bw2" style={{ height: 10 }} />
          <div className="w-1.5 rounded-full bg-hok-orange/60 bw1" style={{ height: 4 }} />
          <div className="w-1.5 rounded-full bg-hok-orange/50 bw3" style={{ height: 6 }} />
        </div>

        {/* Bottom handle bar */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-6 bg-gradient-to-t from-black/70 to-transparent z-10">
          <p className="text-white/60 text-[10px] font-medium truncate">#{topic.toLowerCase().replace(/\s+/g, '')} #EHBO #hetoranjekruis</p>
        </div>
      </div>
    </div>
  )
}
