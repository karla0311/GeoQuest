import { useNavigate } from "react-router-dom"
import GlobeBackground from "../components/Backgrounds/GlobeBackground"
import StarFieldBackground from "../components/Backgrounds/StarFieldBackground"
import { Flag, MapPin, Landmark } from 'lucide-react';

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
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center pt-15">

        <div className="py-4 px-6 flex flex-col items-center justify-center">

          <div className="max-w-6xl w-full text-center">
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-1 tracking-normal font-pixel">
            GeoQuest
            </h1>

            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
              Learn geography through fast-paced challenges. Identify flags, locate countries,
              and match capitals while climbing the leaderboard.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center mb-14">

              <button
                onClick={() => navigate("/login")}
                className="px-8 py-4 bg-emerald-500 text-white rounded-xl text-lg font-semibold
                hover:bg-white hover:text-emerald-600 hover:shadow-[0_0_25px_rgba(16,185,129,0.35)]
                transform hover:scale-105 transition-all duration-300 group flex items-center gap-2"
              >
                <span>PLAY</span>
              </button>

              <button
                onClick={() => navigate("/login")}
                className="px-8 py-4 border-2 border-emerald-500 text-emerald-400 rounded-xl text-lg font-semibold
                hover:bg-emerald-500 hover:text-white hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]
                transform hover:scale-105 transition-all duration-300"
              >
                Practice
              </button>
            </div>

            <p className="text-gray-400 text-sm mb-10 -mt-8">
              Already have an account? <span onClick={() => navigate("/login")} className="text-emerald-400 cursor-pointer hover:underline">Log in</span> or <span onClick={() => navigate("/register")} className="text-emerald-400 cursor-pointer hover:underline">Sign up</span> to save your progress.
            </p>

            {/* Feature Cards */}
            <div className="flex flex-row justify-center gap-8 text-center scale-90 md:scale-75 origin-center">

              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3
                hover:bg-white/30 hover:-translate-y-2 transition-all duration-300 border border-white/5">
                <Flag className="w-10 h-10 text-white mx-auto mb-3" strokeWidth={1.5} />
                <h3 className="text-lg font-semibold text-white mb-2">Flags</h3>
                <p className="text-gray-300 text-sm">Test your world flag knowledge</p>
              </div>

              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3
                hover:bg-white/30 hover:-translate-y-2 transition-all duration-300 border border-white/5">
                <MapPin className="w-10 h-10 text-white mx-auto mb-3" strokeWidth={1.5} />
                <h3 className="text-lg font-semibold text-white mb-2">Map Mode</h3>
                <p className="text-gray-300 text-sm">Pin countries across the globe</p>
              </div>

              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3
                hover:bg-white/30 hover:-translate-y-2 transition-all duration-300 border border-white/5">
                <Landmark className="w-10 h-10 text-white mx-auto mb-3" strokeWidth={1.5} />
                <h3 className="text-lg font-semibold text-white mb-2">Capitals</h3>
                <p className="text-gray-300 text-sm">Solve the global capital puzzle</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    
    </div>
  )
}

export default Landing