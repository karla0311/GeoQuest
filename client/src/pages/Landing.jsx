import { useNavigate } from "react-router-dom"

function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-900">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">GeoQuest</h1>
        <p className="text-xl text-gray-400 mb-10">
          Test your geography knowledge. Identify flags, pin countries, match capitals.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-emerald-700 text-white rounded-lg text-lg hover:bg-emerald-600"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-6 py-3 border border-emerald-700 text-emerald-600 rounded-lg text-lg hover:bg-zinc-800"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  )
}

export default Landing