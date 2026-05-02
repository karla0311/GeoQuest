import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import StarFieldBackground from "../components/Backgrounds/StarFieldBackground"

function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [registered, setRegistered] = useState(false)

  const handleRegister = async () => {
    const trimmedUsername = username.trim()
    if (trimmedUsername.length < 2 || trimmedUsername.length > 20) {
      setError("Username must be between 2 and 20 characters")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    const { error } = await register(email, password, trimmedUsername)
    if (error) {
      setError(error.message)
    } else {
      setRegistered(true)
    }
  }

  if (registered) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-transparent flex items-center justify-center px-6">
        <StarFieldBackground />
        
        <div className="relative z-20 w-full max-w-md bg-black/25 backdrop-blur-md p-10 rounded-3xl border border-white/10 shadow-2xl text-center">
          <div className="text-5xl mb-5">✉️</div>
          <h2 className="text-3xl font-bold text-white mb-4 font-fraunces">Check Your Email</h2>
          <p className="text-gray-300 mb-8">
            We sent a confirmation link to <span className="text-emerald-400 font-semibold">{email}</span>. Click the link to verify your account, then log in.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-emerald-500 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-emerald-600 hover:shadow-[0_0_25px_rgba(16,185,129,0.35)] transform hover:scale-105 transition-all duration-300 w-full"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent flex items-center justify-center px-6">
      <StarFieldBackground />
      
      <div className="relative z-20 w-full max-w-md bg-black/25 backdrop-blur-md p-10 rounded-3xl border border-white/10 shadow-2xl">
        <h2 className="text-4xl font-bold text-white mb-8 text-center font-fraunces">Create Account</h2>
        
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border border-emerald-500/50 rounded-lg px-4 py-3 text-gray-200 bg-[#0f1a12]/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-emerald-500/50 rounded-lg px-4 py-3 text-gray-200 bg-[#0f1a12]/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-emerald-500/50 rounded-lg px-4 py-3 text-gray-200 bg-[#0f1a12]/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border border-emerald-500/50 rounded-lg px-4 py-3 text-gray-200 bg-[#0f1a12]/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          
          <button
            onClick={handleRegister}
            className="bg-emerald-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-emerald-600 hover:shadow-[0_0_25px_rgba(16,185,129,0.35)] transform hover:scale-105 transition-all duration-300 mt-2"
          >
            Create Account
          </button>
        </div>
        
        <p className="text-center text-gray-300 mt-6">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-emerald-400 cursor-pointer hover:text-white transition-colors font-semibold"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  )
}

export default Register