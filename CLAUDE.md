@AGENTS.md

# Het Oranje Kruis – EHBO Quiz App

Live multiplayer EHBO-quiz (Kahoot-stijl) gebouwd voor Het Oranje Kruis assessment (mei 2026).

## Stack
- **Next.js 16** (App Router, TypeScript, src/ directory, `@/*` alias)
- **Supabase** (Auth magic link, PostgreSQL, Realtime) — project: `njmldaylxbgpjwzcqujb`
- **Tailwind CSS v4** (`@import "tailwindcss"` syntax, `@theme inline` blok in globals.css)
- **Zustand v5** (client-side game state in `src/store/gameStore.ts`)
- **canvas-confetti** (confetti bij correct antwoord & eindleaderboard)
- **react-qr-code** (QR-code in de lobby)

## Commands
```bash
npm run dev    # development server op localhost:3000
npm run build  # productie build + TypeScript check
npm run lint   # ESLint
```

## Game flow
**Host:** login → dashboard → sessie aanmaken → lobby (QR + code) → quiz starten → per vraag sturen → leaderboard
**Speler:** `/play` → nickname + code → wachtkamer → vragen beantwoorden → feedback + punten → eindlevel

## Supabase Realtime
Subscriptions actief op: `game_sessions`, `game_players`, `game_answers`

## Score systeem
`points = Math.max(100, Math.floor(1000 * (1 - response_time_ms / (time_limit * 1000))))`

**Levels (% van max score):**  ⭐ < 40%  |  🧡 40–75%  |  🏆 > 75%

## Vragen
10 officiële EHBO-vragen uit Het Oranje Kruis Boekje 29e druk (2026) — `src/lib/game/seedData.ts`

## Tailwind v4
Kleuren via `@theme inline` in globals.css. Gebruik `bg-hok-orange`, `text-hok-navy`, `bg-hok-bg`, etc.

## Deploy
Vercel MCP + GitHub — nog te koppelen. Stel in op Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
- `NEXT_PUBLIC_SITE_URL` (productie-URL voor magic link redirect)
