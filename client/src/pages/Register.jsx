import { useNavigate } from "react-router-dom"

function Register() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <div className="bg-zinc-800 p-8 rounded-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Sign Up</h2>
        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="border border-zinc-600 rounded-lg px-4 py-3 text-gray-200 bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
          <input
            type="password"
            placeholder="Password"
            className="border border-zinc-600 rounded-lg px-4 py-3 text-gray-200 bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="border border-zinc-600 rounded-lg px-4 py-3 text-gray-200 bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
          <button className="bg-emerald-700 text-white py-3 rounded-lg text-lg hover:bg-emerald-600">
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