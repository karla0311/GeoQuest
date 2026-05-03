import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import StarFieldBackground from "../components/Backgrounds/StarFieldBackground"
import API from "../api/api"
import { Trophy } from 'lucide-react'
import BrandLogo from "../components/BrandLogo"

function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [stats, setStats] = useState(null)
  const [completedStages, setCompletedStages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [mode, setMode] = useState("all"); // "all" | "daily" | "practice"

  useEffect(() => {
    // each request is independent, a failure on one shouldn't blank the other
    API.get("/stats/user", {
      params: { mode },
    })
      .then(res => setStats(res.data))
      .catch(err => console.error("stats fetch failed", err));

    API.get("/game/daily-status")
      .then(res => setCompletedStages(res.data ?? []))
      .catch(err => console.error("daily-status fetch failed", err))
      .finally(() => setIsLoading(false));
  }, [mode]);

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const startNewGame = (is_daily) => {
    if (is_daily) {
      if (completedStages.length >= 3) {
        alert("You've already finished today's Daily Challenge! Come back tomorrow.")
        return
      }
      navigate("/game", { state: { is_daily: true, startStage: 1 } });
    } else {
      navigate("/game", { state: { is_daily: false } });
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      <StarFieldBackground />

      {/* Navbar */}
      <nav className="relative z-10 bg-black/30 backdrop-blur-md px-8 py-4 flex justify-between items-center border-b border-white/10">
        <BrandLogo />
        <div className="flex items-center gap-4">
          <span className="text-gray-300 text-sm">Welcome, <span className="text-emerald-400 font-semibold">{user?.user_metadata?.username ?? user?.email?.split('@')[0] ?? "Player"}</span></span>
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
        <div className="bg-black/25 backdrop-blur-md rounded-2xl p-10 mb-12 flex flex-col md:flex-row justify-between items-center shadow-xl border border-white/10">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-3xl font-bold mb-2 font-fraunces text-white">Choose Your Journey</h2>
            <p className="text-gray-400">Play the daily challenge for the leaderboard, or sharpen your skills in practice.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Practice Mode Button */}
            <button
              onClick={() => startNewGame(false)}
              className="px-6 py-4 border border-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-200"
            >
              Practice Mode
            </button>

            {/* Daily Challenge Button */}
            {isLoading ? (
              <button className="px-8 py-4 rounded-xl font-bold text-lg bg-gray-700 text-gray-400 animate-pulse cursor-wait">
                Loading...
              </button>
            ) : (
              <button
                onClick={
                  completedStages.length >= 3 
                    ? () => navigate("/results", { state: { is_daily: true } }) 
                    : () => startNewGame(true)
                }
                className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                  completedStages.length >= 3 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : "bg-emerald-500 text-white hover:bg-emerald-600"
                }`}
              >
                {completedStages.length >= 3 ? "View Today's Results" : "Daily Challenge"}
              </button>
            )}
                </div>
              </div>
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setMode("all")}
            className={`px-4 py-2 rounded-lg ${
              mode === "all"
                ? "bg-emerald-600 text-white"
                : "bg-zinc-800 text-gray-400"
            }`}
          >
            All Time
          </button>

          <button
            onClick={() => setMode("daily")}
            className={`px-4 py-2 rounded-lg ${
              mode === "daily"
                ? "bg-emerald-600 text-white"
                : "bg-zinc-800 text-gray-400"
            }`}
          >
            Daily Only
          </button>

          <button
            onClick={() => setMode("practice")}
            className={`px-4 py-2 rounded-lg ${
              mode === "practice"
                ? "bg-emerald-600 text-white"
                : "bg-zinc-800 text-gray-400"
            }`}
          >
            Practice Only
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
          <div className="bg-black/25 backdrop-blur-md rounded-2xl p-8 border border-white/10 
            hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] 
            transition-all duration-300 flex flex-col items-center text-center">
            <div className="flex flex-col items-center mb-4">
              <Trophy className="w-10 h-10 text-white opacity-90 mb-3" strokeWidth={1.5} />
              <h3 className="text-2xl font-bold text-white font-fraunces">Leaderboard</h3>
              <p className="text-gray-400 text-sm">Compete with players worldwide</p>
            </div>
            <button 
              onClick={() => navigate("/leaderboard")} 
              className="text-emerald-400 hover:text-white font-semibold text-sm transition-colors"
            >
              View Rankings →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard