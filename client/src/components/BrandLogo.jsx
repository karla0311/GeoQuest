import { useNavigate } from "react-router-dom"

// shared header brand — clicking it always returns to /dashboard
export default function BrandLogo() {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate("/dashboard")}
      className="flex items-center gap-3 group"
      aria-label="Go to dashboard"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-8 h-8 text-white opacity-90 group-hover:opacity-100 group-hover:text-emerald-400 transition-colors"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      <h1 className="text-xl text-white font-pixel uppercase tracking-tight leading-none translate-y-[3px] group-hover:text-emerald-400 transition-colors">
        GeoQuest
      </h1>
    </button>
  )
}
