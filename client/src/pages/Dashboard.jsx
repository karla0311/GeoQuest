import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import StarFieldBackground from "../components/Backgrounds/StarFieldBackground"
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
    <div className="min-h-screen bg-transparent">
      <StarFieldBackground />

      {/* Navbar */}
      <nav className="relative z-10 bg-black/30 backdrop-blur-md px-8 py-4 flex justify-between items-center border-b border-white/10">
        <h1 className="text-3xl font-bold text-white font-fraunces">🌍 GeoQuest</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-300 text-sm">Welcome, <span className="text-emerald-400 font-semibold">{user?.email?.split('@')[0] ?? "Player"}</span></span>
          <button
            onClick={() => navigate("/forum")}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-all duration-200"
          >
            Forum
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-emerald-500/50 text-gray-300 rounded-lg text-sm hover:bg-emerald-500/20 transition-all duration-200"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-8 py-12">

        {/* Quick Start Hero */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl p-10 mb-12 flex justify-between items-center shadow-xl border border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-300">
          <div>
            <h2 className="text-3xl font-bold mb-2 font-fraunces"> Ready for a Challenge?</h2>
            <p className="text-white">Test your geography skills and climb the leaderboard.</p>
          </div>
          <button
            onClick={() => navigate("/game")}
            className="px-8 py-4 bg-white text-emerald-500 rounded-xl font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Start Game
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="group bg-black/25 backdrop-blur-md rounded-2xl p-8 text-center border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all duration-300 cursor-default">
            <div className="text-5xl font-bold text-emerald-400 mb-2 group-hover:scale-110 transition-transform duration-300">{stats ? stats.games_played : "--"}</div>
            <p className="text-gray-300 text-lg font-semibold">Games Played</p>
            <p className="text-gray-500 text-sm mt-2">Keep playing to improve</p>
          </div>
          <div className="group bg-black/25 backdrop-blur-md rounded-2xl p-8 text-center border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all duration-300 cursor-default">
            <div className="text-5xl font-bold text-emerald-400 mb-2 group-hover:scale-110 transition-transform duration-300">{stats ? stats.avg_score : "--"}</div>
            <p className="text-gray-300 text-lg font-semibold">Average Score</p>
            <p className="text-gray-500 text-sm mt-2">What's the highest you can go?</p>
          </div>
          <div className="group bg-black/25 backdrop-blur-md rounded-2xl p-8 text-center border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all duration-300 cursor-default">
            <div className="text-5xl font-bold text-emerald-400 mb-2 group-hover:scale-110 transition-transform duration-300">{stats ? `${stats.avg_accuracy}%` : "--"}</div>
            <p className="text-gray-300 text-lg font-semibold">Accuracy</p>
            <p className="text-gray-500 text-sm mt-2">Stay sharp and focused</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-black/25 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white font-fraunces mb-1">🏆 Leaderboard</h3>
                <p className="text-gray-400 text-sm">Compete with players worldwide</p>
              </div>
            </div>
            <button onClick={() => navigate("/leaderboard")} className="text-emerald-400 hover:text-white font-semibold text-sm transition-colors">View Rankings →</button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard