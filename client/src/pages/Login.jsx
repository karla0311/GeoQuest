import { useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/api"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleLogin = async () => {
    const res = await API.post("/auth/login", { email, password })
    localStorage.setItem("token", res.data.access_token)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <div className="bg-zinc-800 p-8 rounded-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Login</h2>
        <div className="flex flex-col gap-4">
          <input
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="border border-zinc-600 rounded-lg px-4 py-3 text-gray-200 bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="border border-zinc-600 rounded-lg px-4 py-3 text-gray-200 bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
          <button
            onClick={handleLogin}
            className="bg-emerald-700 text-white py-3 rounded-lg text-lg hover:bg-emerald-600"
          >
            Login
          </button>
        </div>
        <p className="text-center text-gray-400 mt-4">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-emerald-700 cursor-pointer hover:underline"
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  )
}