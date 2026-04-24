import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { getLastGameResult, getGameById } from "../api/gameService"

// labels for each stage of a game session
const STAGE_LABELS = {
  1: "Flag",
  2: "Map Pinpoint",
  3: "Capitals & Languages",
}

// formats a duration in seconds to a short human-readable string
function formatTime(seconds) {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

// ── Stage card ────────────────────────────────────────────────────────────────
// renders a summary card for one stage. if data is null the stage hasn't been
// built yet and we show a placeholder so the layout stays consistent
function StageCard({ stageNum, data }) {
  const label = STAGE_LABELS[stageNum]

  if (!data) {
    return (
      <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-5 flex flex-col gap-2 opacity-60">
        <p className="text-xs uppercase tracking-wider text-gray-500">Stage {stageNum}</p>
        <p className="text-lg font-semibold text-gray-400">{label}</p>
        <p className="text-sm text-gray-500 mt-2">Coming soon</p>
      </div>
    )
  }

  // any non-zero accuracy means at least one correct guess, treat as a win
  const won = data.accuracy > 0
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-gray-400">Stage {stageNum}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full ${won ? "bg-emerald-700 text-white" : "bg-zinc-700 text-red-300"}`}>
          {won ? "Won" : "Lost"}
        </span>
      </div>
      <p className="text-lg font-semibold text-white">{label}</p>
      <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
        <div>
          <p className="text-gray-500 text-xs">Score</p>
          <p className="text-white font-medium">{data.score}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Time</p>
          <p className="text-white font-medium">{formatTime(data.time_taken)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Accuracy</p>
          <p className="text-white font-medium">{data.accuracy}%</p>
        </div>
      </div>
    </div>
  )
}

// ── Results page ──────────────────────────────────────────────────────────────
export default function Results() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const gameId = searchParams.get("id")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  // with an ?id we show that specific game, otherwise fall back to the last one
  useEffect(() => {
    const fetchResult = gameId ? getGameById(gameId) : getLastGameResult()
    fetchResult
      .then(data => setResult(data))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false))
  }, [gameId])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-sm">Could not load results.</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-zinc-700 text-gray-200 rounded-lg hover:bg-zinc-600 text-sm"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h2 className="text-2xl font-bold text-white">No games yet</h2>
        <p className="text-gray-400 text-sm">Play a round and your results will show up here.</p>
        <button
          onClick={() => navigate("/game")}
          className="px-5 py-2.5 bg-emerald-700 text-white rounded-lg hover:bg-emerald-600"
        >
          Start a Game
        </button>
      </div>
    )
  }

  // map the single row we have to its stage slot. when stages 2 and 3 are
  // built this can grow into fetching the whole session's rows
  const stages = {
    1: result.stage === 1 ? result : null,
    2: result.stage === 2 ? result : null,
    3: result.stage === 3 ? result : null,
  }
  const totalScore = Object.values(stages).filter(Boolean).reduce((sum, s) => sum + s.score, 0)

  return (
    <div className="min-h-screen bg-zinc-900 px-4 py-10">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        <div className="text-center">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Results</p>
          <h1 className="text-4xl font-bold text-white mb-1">{totalScore}</h1>
          <p className="text-gray-400 text-sm">Total Score</p>
          {result.country && (
            <p className="text-emerald-400 text-base font-medium mt-3">{result.country}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StageCard stageNum={1} data={stages[1]} />
          <StageCard stageNum={2} data={stages[2]} />
          <StageCard stageNum={3} data={stages[3]} />
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate("/game")}
            className="px-5 py-2.5 bg-emerald-700 text-white rounded-lg hover:bg-emerald-600"
          >
            Play Again
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2.5 border border-zinc-600 text-gray-300 rounded-lg hover:bg-zinc-800"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
