import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom" // added useLocation here
import { getLastGameResult } from "../api/gameService"
import StarFieldBackground from "../components/Backgrounds/StarFieldBackground";

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
      <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-5 flex flex-col gap-2 opacity-60 backdrop-blur-sm">
        <p className="text-xs uppercase tracking-wider text-gray-500">Stage {stageNum}</p>
        <p className="text-lg font-semibold text-gray-400">{label}</p>
        <p className="text-sm text-gray-500 mt-2">Coming soon</p>
      </div>
    )
  }

  // any non-zero accuracy means at least one correct guess, treat as a win
  const won = data.accuracy > 0
  return (
    <div className="bg-zinc-800/80 border border-zinc-700 rounded-xl p-5 flex flex-col gap-2 backdrop-blur-md">
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
  const location = useLocation() // added to detect game mode
  const is_daily = location.state?.is_daily || false // determine if this was a daily challenge
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  // pull the user's last game from the backend so results survive a refresh
  useEffect(() => {
    getLastGameResult()
      .then(data => setResult(data))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="relative min-h-screen bg-transparent flex items-center justify-center">
        <StarFieldBackground />
        <p className="relative z-10 text-gray-400 text-sm">Loading...</p>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="relative min-h-screen bg-zinc-900 flex flex-col items-center justify-center gap-4">
        <StarFieldBackground />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <p className="text-red-400 text-sm">Could not load results.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-zinc-700 text-gray-200 rounded-lg hover:bg-zinc-600 text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!result || (Array.isArray(result) && result.length === 0)) {
    return (
      <div className="relative min-h-screen bg-zinc-900 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <StarFieldBackground />
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white">No games yet</h2>
          <p className="text-gray-400 text-sm mb-4">Play a round and your results will show up here.</p>
          <button
            onClick={() => navigate("/game")}
            className="px-5 py-2.5 bg-emerald-700 text-white rounded-lg hover:bg-emerald-600"
          >
            Start a Game
          </button>
        </div>
      </div>
    )
  }

  // keep rows played within 15 minutes of the newest one as one session
  const resultsArray = Array.isArray(result) ? result : [result]
  const SESSION_GAP_MS = 15 * 60 * 1000
  const newest = resultsArray.length ? new Date(resultsArray[0].played_at).getTime() : 0
  const sessionRows = resultsArray.filter(r => newest - new Date(r.played_at).getTime() < SESSION_GAP_MS)

  const stages = {
    1: sessionRows.find(r => Number(r.stage) === 1) || null,
    2: sessionRows.find(r => Number(r.stage) === 2) || null,
    3: sessionRows.find(r => Number(r.stage) === 3) || null,
  }

  // sum up stage scores for total
  const totalScore = Object.values(stages).filter(Boolean).reduce((sum, s) => sum + s.score, 0)

  return (
    <div className="relative min-h-screen bg-transparent px-4 py-10 overflow-hidden">
      <StarFieldBackground />
      <div className="relative z-10 max-w-3xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="text-center">
          <p className={`text-xs uppercase tracking-wider mb-2 ${is_daily ? "text-emerald-500" : "text-gray-500"}`}>
            {is_daily ? "Daily Challenge Complete" : "Practice Mode Complete"}
          </p>
          <h1 className="text-4xl font-bold text-white mb-1">{totalScore}</h1>
          <p className="text-gray-400 text-sm">Total Score</p>
          {!is_daily && (
            <p className="text-zinc-500 text-xs mt-2 italic">
              Stats not recorded in Practice Mode
            </p>
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
            className="px-5 py-2.5 bg-emerald-700 text-white rounded-lg hover:bg-emerald-600 transition-all duration-300"
          >
            Play Again
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2.5 border border-zinc-600 text-gray-300 rounded-lg hover:bg-zinc-800 transition-all duration-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}