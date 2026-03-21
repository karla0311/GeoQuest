import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import API from "../api/api"

function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    API.get("/stats/user").then(res => setStats(res.data))
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
            <p className="text-gray-400 text-sm">No recent games yet.</p>
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