import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getGameHistory } from "../api/gameService"

// same UTC-safe parser as Dashboard since postgres returns played_at naked
function timeAgo(dateStr) {
  const date = new Date(dateStr.replace(" ", "T") + "Z")
  const diff = (Date.now() - date) / 1000
  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function formatDate(dateStr) {
  const d = new Date(dateStr.replace(" ", "T") + "Z")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function History() {
  const navigate = useNavigate()
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getGameHistory()
      .then(data => setGames(Array.isArray(data) ? data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-zinc-900">
      <nav className="bg-zinc-800 px-8 py-4 flex items-center gap-4">
        <button onClick={() => navigate("/dashboard")} className="text-gray-400 hover:text-white text-sm">
          ← Dashboard
        </button>
        <h1 className="text-lg font-semibold text-white">Game History</h1>
      </nav>

      <div className="max-w-3xl mx-auto px-8 py-10">
        {loading && <p className="text-gray-400 text-sm">Loading...</p>}
        {error && <p className="text-red-400 text-sm">Could not load history.</p>}
        {!loading && !error && games.length === 0 && (
          <p className="text-gray-400 text-sm">No games yet.</p>
        )}
        {!loading && !error && games.length > 0 && (
          <div className="flex flex-col gap-2">
            {games.map((game) => {
              const won = game.accuracy > 0
              const label = game.country ?? "Flag Stage 1"
              const guessCount = won ? 7 - game.score / 100 : null

              return (
                <div
                  key={game.id}
                  onClick={() => navigate(`/results?id=${game.id}`)}
                  className="bg-zinc-800 rounded-xl px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      won ? "bg-emerald-900 text-emerald-400" : "bg-red-900/60 text-red-400"
                    }`}>
                      {won ? "Won" : "Lost"}
                    </span>
                    <div>
                      <p className="text-white font-medium text-sm">{label}</p>
                      <p className="text-xs text-gray-500">
                        Stage {game.stage}
                        {" · "}
                        {won ? `${guessCount} guess${guessCount !== 1 ? "es" : ""}` : "No guesses left"}
                        {" · "}{game.score}pts · {game.accuracy}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{formatDate(game.played_at)}</p>
                    <p className="text-xs text-gray-500">{timeAgo(game.played_at)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
