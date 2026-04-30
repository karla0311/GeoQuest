import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import StarFieldBackground from "../components/Backgrounds/StarFieldBackground"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleLogin = async () => {
    const { error } = await login(email, password)
    if (error) {
      setError(error.message)
    } else {
      navigate("/dashboard")
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent flex items-center justify-center px-6">
      <StarFieldBackground />
      
      <div className="relative z-20 w-full max-w-md bg-black/25 backdrop-blur-md p-10 rounded-3xl border border-white/10 shadow-2xl">
        <h2 className="text-4xl font-bold text-white mb-8 text-center font-fraunces">Welcome Back</h2>
        
        <div className="flex flex-col gap-4">
          <input
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="border border-[#4a6b4f]/50 rounded-lg px-4 py-3 text-gray-200 bg-[#0f1a12]/60 focus:outline-none focus:ring-2 focus:ring-[#4a6b4f] transition-all"
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="border border-[#4a6b4f]/50 rounded-lg px-4 py-3 text-gray-200 bg-[#0f1a12]/60 focus:outline-none focus:ring-2 focus:ring-[#4a6b4f] transition-all"
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          
          <button
            onClick={handleLogin}
            className="bg-[#4a6b4f] text-white py-3 rounded-lg text-lg font-semibold hover:bg-[#5f8463] hover:shadow-[0_0_25px_rgba(154,183,154,0.35)] transform hover:scale-105 transition-all duration-300 mt-2"
          >
            🚀 Login
          </button>
        </div>
        
        <p className="text-center text-gray-300 mt-6">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-[#9ab79a] cursor-pointer hover:text-white transition-colors font-semibold"
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  )
}