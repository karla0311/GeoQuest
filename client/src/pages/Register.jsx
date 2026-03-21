import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")

  const handleRegister = async () => {
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    const { error } = await register(email, password)
    if (error) {
      setError(error.message)
    } else {
      navigate("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <div className="bg-zinc-800 p-8 rounded-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Sign Up</h2>
        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            className="border border-zinc-600 rounded-lg px-4 py-3 text-gray-200 bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="border border-zinc-600 rounded-lg px-4 py-3 text-gray-200 bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border border-zinc-600 rounded-lg px-4 py-3 text-gray-200 bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            onClick={handleRegister}
            className="bg-emerald-700 text-white py-3 rounded-lg text-lg hover:bg-emerald-600"
          >
            Create Account
          </button>
        </div>
        <p className="text-center text-gray-400 mt-4">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-emerald-700 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  )
}

export default Register