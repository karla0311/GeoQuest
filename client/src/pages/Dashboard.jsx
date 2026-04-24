import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import API from "../api/api"
import { getRecentGames } from "../api/gameService"

// short relative timestamp for the activity feed. postgres returns played_at
// without a timezone so we force UTC to keep the math honest across browsers
function timeAgo(dateStr) {
  const date = new Date(dateStr.replace(" ", "T") + "Z")
  const diff = (Date.now() - date) / 1000
  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [recentError, setRecentError] = useState(false)

  useEffect(() => {
    API.get("/stats/user").then(res => setStats(res.data))

    // loaded separately so a stats failure doesn't blank out the activity list
    getRecentGames()
      .then(data => setRecent(Array.isArray(data) ? data : []))
      .catch(() => setRecentError(true))
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-zinc-900">

      {/* Navbar */}
      <nav className="bg-zinc-800 px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-emerald-700">GeoQuest</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-300">Welcome, {user?.email ?? "Player"}</span>
          <button
            onClick={() => navigate("/forum")}
            className="bg-zinc-700 text-white px-4 py-2 rounded-lg hover:bg-zinc-600"
          >
            Go to Forum
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-zinc-600 rounded-lg text-gray-300 hover:bg-zinc-700"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-10">

        {/* Quick Start */}
        <div className="bg-emerald-700 text-white rounded-xl p-8 mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-1">Ready to play?</h2>
            <p className="text-emerald-100">Start a new game and test your geography knowledge.</p>
          </div>
          <button
            onClick={() => navigate("/game")}
            className="bg-white text-emerald-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
          >
            Start New Game
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-800 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-white">{stats ? stats.games_played : "--"}</p>
            <p className="text-gray-400 mt-1">Games Played</p>
          </div>
          <div className="bg-zinc-800 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-white">{stats ? stats.avg_score : "--"}</p>
            <p className="text-gray-400 mt-1">Average Score</p>
          </div>
          <div className="bg-zinc-800 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-white">{stats ? `${stats.avg_accuracy}%` : "--"}</p>
            <p className="text-gray-400 mt-1">Accuracy</p>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-2 gap-6">

          {/* Recent Activity */}
          <div className="bg-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            {recentError ? (
              <p className="text-red-400 text-sm">Couldn't load recent games.</p>
            ) : recent.length === 0 ? (
              <p className="text-gray-400 text-sm">No games yet. Play your first!</p>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  {recent.map((game) => {
                    const won = game.accuracy > 0
                    // score encodes guess count for a win: (7 - guessCount) * 100
                    const guessCount = won ? 7 - game.score / 100 : null
                    const label = game.country ?? "Flag Stage 1"

                    return (
                      <div
                        key={game.id}
                        onClick={() => navigate(`/results?id=${game.id}`)}
                        className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-zinc-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            won ? "bg-emerald-900 text-emerald-400" : "bg-red-900/60 text-red-400"
                          }`}>
                            {won ? "Won" : "Lost"}
                          </span>
                          <div>
                            <p className="text-sm text-white font-medium">{label}</p>
                            <p className="text-xs text-gray-500">
                              {won ? `${guessCount} guess${guessCount !== 1 ? "es" : ""}` : "No guesses left"}
                              {" · "}{game.score}pts · {game.accuracy}%
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">{timeAgo(game.played_at)}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-zinc-700">
                  <button
                    onClick={() => navigate("/history")}
                    className="text-xs text-emerald-500 hover:text-emerald-400"
                  >
                    View Full History →
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Leaderboard Preview */}
          <div className="bg-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Leaderboard</h3>
            <p className="text-gray-400 text-sm">No scores yet.</p>
          </div>

        </div>

      </div>
    </div>
  )
}

export default Dashboard