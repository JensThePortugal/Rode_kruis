import { PlayerGameClient } from './PlayerGameClient'

interface Props {
  params: Promise<{ sessionId: string }>
  searchParams: Promise<{ player?: string }>
}

export default async function PlayerGamePage({ params, searchParams }: Props) {
  const { sessionId } = await params
  const { player: playerId } = await searchParams

  if (!playerId) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-black text-hok-navy mb-2">Sessie niet gevonden</h2>
          <a href="/play" className="text-hok-orange font-bold underline underline-offset-2">
            Opnieuw joinen
          </a>
        </div>
      </main>
    )
  }

  return <PlayerGameClient sessionId={sessionId} playerId={playerId} />
}
