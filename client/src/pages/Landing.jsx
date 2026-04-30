import { useNavigate } from "react-router-dom"
import GlobeBackground from "../components/Backgrounds/GlobeBackground"
import StarFieldBackground from "../components/Backgrounds/StarFieldBackground"

function Landing() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* 🌌 STAR FIELD (BACKGROUND LAYER) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <StarFieldBackground />
      </div>

      {/* 🌍 GLOBE (MIDDLE LAYER) */}
      <div className="fixed inset-0 z-5 pointer-events-none">
        <GlobeBackground />
      </div>

      {/* 📦 CONTENT (TOP LAYER) */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-6">

        <div className="text-center max-w-4xl mx-auto 
          bg-black/25 backdrop-blur-md p-10 rounded-3xl 
          border border-white/10 shadow-2xl
          mt-56 md:mt-64">

          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight font-fraunces">
            🌍 GeoQuest
          </h1>

          <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
            Learn geography through fast-paced challenges. Identify flags, locate countries,
            and match capitals while climbing the leaderboard.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-14">

            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 bg-[#4a6b4f] text-white rounded-xl text-lg font-semibold
              hover:bg-[#5f8463] hover:shadow-[0_0_25px_rgba(154,183,154,0.35)]
              transform hover:scale-105 transition-all duration-300"
            >
              🚀 Start Playing
            </button>

            <button
              onClick={() => navigate("/register")}
              className="px-8 py-4 border-2 border-[#4a6b4f] text-[#9ab79a] rounded-xl text-lg font-semibold
              hover:bg-[#4a6b4f] hover:text-white hover:shadow-[0_0_25px_rgba(154,183,154,0.25)]
              transform hover:scale-105 transition-all duration-300"
            >
              📝 Sign Up
            </button>

          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">

            <div className="bg-[#304d36]/70 backdrop-blur-sm rounded-xl p-6
            hover:bg-[#304d36]/90 hover:-translate-y-2 transition-all duration-300 border border-white/5">
              <div className="text-4xl mb-3">🏴</div>
              <h3 className="text-lg font-semibold text-white mb-2">Flags</h3>
              <p className="text-gray-300 text-sm">Test your world flag knowledge</p>
            </div>

            <div className="bg-[#304d36]/70 backdrop-blur-sm rounded-xl p-6
            hover:bg-[#304d36]/90 hover:-translate-y-2 transition-all duration-300 border border-white/5">
              <div className="text-4xl mb-3">📍</div>
              <h3 className="text-lg font-semibold text-white mb-2">Map Mode</h3>
              <p className="text-gray-300 text-sm">Pin countries on a global map</p>
            </div>

            <div className="bg-[#304d36]/70 backdrop-blur-sm rounded-xl p-6
            hover:bg-[#304d36]/90 hover:-translate-y-2 transition-all duration-300 border border-white/5">
              <div className="text-4xl mb-3">🏛️</div>
              <h3 className="text-lg font-semibold text-white mb-2">Capitals</h3>
              <p className="text-gray-300 text-sm">Match capitals and languages</p>
            </div>

          </div>

        </div>
      </div>

    </div>
  )
}

export default Landing