'use client'

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
      <div className="w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-xl slide-up">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
          className="w-full aspect-video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        <div className="bg-hok-navy px-4 py-2.5 flex items-center justify-between">
          <p className="text-white text-xs font-bold truncate">{topic}</p>
          <p className="text-hok-orange text-xs shrink-0 ml-2">@hetoranjekruis</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm mx-auto slide-up">
      <div
        className="relative rounded-2xl overflow-hidden shadow-xl"
        style={{
          background: 'linear-gradient(135deg, #003366 0%, #1A4D8F 60%, #003366 100%)',
          aspectRatio: '16/9',
        }}
      >
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, #F47920 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />

        {/* TikTok-style right sidebar */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-white/40 text-base">❤️</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-white/40 text-base">💬</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-white/40 text-base">↗️</span>
          </div>
        </div>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
          <div className="relative mb-3">
            <div className="absolute inset-0 rounded-full bg-hok-orange/25 scale-[1.8] animate-pulse" />
            <div className="w-12 h-12 bg-hok-orange rounded-full flex items-center justify-center shadow-lg relative">
              <div
                className="w-0 h-0 ml-1"
                style={{
                  borderTop: '8px solid transparent',
                  borderBottom: '8px solid transparent',
                  borderLeft: '14px solid white',
                }}
              />
            </div>
          </div>
          <p className="text-white font-black text-sm leading-tight mb-1">{topic}</p>
          <span className="bg-hok-orange/20 border border-hok-orange/40 rounded-full px-3 py-0.5 text-hok-orange text-[10px] font-bold tracking-wide uppercase">
            Binnenkort
          </span>
        </div>

        {/* Bottom handle */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-white/50 text-[10px]">@hetoranjekruis</p>
        </div>
      </div>
    </div>
  )
}
