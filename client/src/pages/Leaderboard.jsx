import { useEffect, useState } from "react";
import { getLeaderboard } from "../api/leaderboardService";
import StarFieldBackground from "../components/Backgrounds/StarFieldBackground";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BrandLogo from "../components/BrandLogo";

function formatTime(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function Leaderboard() {
  const [data, setData] = useState(null);
  const [mode, setMode] = useState(true);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentUserId = user?.id;

  useEffect(() => {
    setLoading(true);
    getLeaderboard(mode)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [mode]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <StarFieldBackground />
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <StarFieldBackground />

      {/* NAVBAR */}
      <nav className="relative z-10 bg-black/30 backdrop-blur-md px-8 py-4 flex justify-between items-center border-b border-white/10">
        <BrandLogo />
        <div className="flex items-center gap-4">
          <span className="text-gray-300 text-sm">
            Welcome,{" "}
            <span className="text-emerald-400 font-semibold">
              {user?.user_metadata?.username ??
                user?.email?.split("@")[0] ??
                "Player"}
            </span>
          </span>

          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600"
          >
            Dashboard
          </button>

          <button
            onClick={() => navigate("/forum")}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600"
          >
            Forum
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-emerald-500/50 text-gray-300 rounded-lg text-sm hover:bg-emerald-500/20"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10 flex flex-col gap-6">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
          <p className="text-gray-400 text-sm">
            {mode ? "Daily Challenge" : "Practice Mode"}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setMode(true)}
            className={`px-4 py-2 rounded-lg ${
              mode ? "bg-emerald-600 text-white" : "bg-zinc-800 text-gray-400"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setMode(false)}
            className={`px-4 py-2 rounded-lg ${
              !mode ? "bg-emerald-600 text-white" : "bg-zinc-800 text-gray-400"
            }`}
          >
            Practice
          </button>
        </div>

        {/* Top 10 */}
        <div className="bg-zinc-800/70 border border-zinc-700 rounded-xl p-4 backdrop-blur-md">
          <h2 className="text-white font-semibold mb-3">Top 10 --- (by Score)</h2>

          {data.top10?.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              No rankings yet. Be the first 👀
            </p>
          ) : (
            <div className="flex flex-col gap-2">
            {/* HEADER ROW */}
            <div className="flex justify-between text-xs text-gray-400 px-4">
              <div className="flex items-center gap-3">
                <span className="w-6">#</span>
                <span>Username</span>
              </div>

              <div className="flex gap-6">
                <span>Score</span>
                {mode && <span>Time</span>}
                <span>Accuracy</span>
              </div>
            </div>
              {data.top10.map((p) => {
                const isMe = String(p.user_id) === String(currentUserId);

                return (
                  <div
                    key={p.rank}
                    className={`flex justify-between items-center px-4 py-2 rounded-lg ${
                      isMe ? "bg-emerald-500/30 border border-emerald-500" : "bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 w-6">#{p.rank}</span>

                      <span
                        className={`font-medium ${
                          isMe ? "text-emerald-400" : "text-white"
                        }`}
                      >
                        {p.username}
                        {isMe && " (You)"}
                      </span>
                    </div>

                    <div className="flex gap-6 text-sm text-gray-300">
                      <span>{p.total_score}</span>
                      {mode && <span>{formatTime(p.total_time)}</span>}
                      <span>{Math.round(p.avg_accuracy)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* My Rank */}
        {data.me && (
          <div className="bg-emerald-900/20 border border-emerald-700 rounded-xl p-4">
            <h2 className="text-emerald-400 font-semibold mb-3">
              Your Rank
            </h2>

            {/* header labels */}
            <div className="flex justify-between text-xs text-gray-400 mb-2 px-1">
              <span>Rank</span>
              <span>Score</span>
              {mode && <span>Time</span>}
              <span>Accuracy</span>
            </div>

            {/* values */}
            <div className="flex justify-between text-white text-sm">
              <span>#{data.me.rank}</span>
              <span>{data.me.total_score}</span>
              {mode && <span>{formatTime(data.me.total_time)}</span>}
              <span>{Math.round(data.me.avg_accuracy)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}