import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { submitGameResult } from "../api/gameService"
import countryData from "../../countries.json"
import StarFieldBackground from "../components/Backgrounds/StarFieldBackground"
import { useLocation } from "react-router-dom";
import { getDailyCountry } from "../utils/gameUtils";

// number of tile columns and rows (more = smaller tiles)
const COLS = 20
const ROWS = 12
const FLAG_W = 400
const FLAG_H = 250
const TILE_W = FLAG_W / COLS
const TILE_H = FLAG_H / ROWS
const MAX_GUESSES = 6

// displays the flag as scattered tiles that reassemble as revealAmount increases
function ScatterFlag({ src, revealAmount }) {
  const [tiles, setTiles] = useState([])
  const mousePos = useRef({ x: -999, y: -999 })
  const tilesRef = useRef([])
  const animRef = useRef(null)
  const containerRef = useRef(null)

  // randomly scatter each tile on first load
  useEffect(() => {
    const initial = []
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const randomCol = Math.floor(Math.random() * COLS)
        const randomRow = Math.floor(Math.random() * ROWS)
        const tile = {
          id: `${row}-${col}`,
          col,
          row,
          offsetX: (randomCol - col) * TILE_W + (Math.random() - 0.5) * FLAG_W,
          offsetY: (randomRow - row) * TILE_H + (Math.random() - 0.5) * FLAG_H,
          vx: 0,
          vy: 0,
        }
        initial.push(tile)
      }
    }
    tilesRef.current = initial
    setTiles([...initial])
  }, [src])

  // moves tiles toward their target position
  useEffect(() => {
    const loop = () => {
      const mouse = revealAmount >= 1 ? { x: -999, y: -999 } : mousePos.current
      let changed = false

      tilesRef.current = tilesRef.current.map(tile => {
        const targetX = tile.col * TILE_W + tile.offsetX * (1 - revealAmount)
        const targetY = tile.row * TILE_H + tile.offsetY * (1 - revealAmount)

        const currentX = tile.currentX ?? targetX
        const currentY = tile.currentY ?? targetY

        const dx = currentX - mouse.x
        const dy = currentY - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const fleeRadius = 25

        let fx = 0
        let fy = 0

        if (dist < fleeRadius && dist > 0) {
          const force = (fleeRadius - dist) / fleeRadius
          fx = (dx / dist) * force * 6
          fy = (dy / dist) * force * 6
        }

        const springX = (targetX - currentX) * 0.06
        const springY = (targetY - currentY) * 0.06

        const vx = (tile.vx + fx + springX) * 0.8
        const vy = (tile.vy + fy + springY) * 0.8

        const newX = currentX + vx
        const newY = currentY + vy

        if (Math.abs(newX - (tile.currentX ?? 0)) > 0.01) changed = true

        return { ...tile, currentX: newX, currentY: newY, vx, vy }
      })

      setTiles([...tilesRef.current])
      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [revealAmount])

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect()
    mousePos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const handleMouseLeave = () => {
    mousePos.current = { x: -999, y: -999 }
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        width: FLAG_W, 
        height: FLAG_H, 
        position: "relative", 
        overflow: "hidden", 
        borderRadius: 12, 
        cursor: "default" 
      }}
    >
      {tiles.map((tile) => (
        <div
          key={tile.id}
          style={{
            position: "absolute",
            width: TILE_W,
            height: TILE_H,
            left: tile.currentX ?? tile.col * TILE_W,
            top: tile.currentY ?? tile.row * TILE_H,
            backgroundImage: `url(${src})`,
            backgroundSize: `${FLAG_W}px ${FLAG_H}px`,
            backgroundPosition: `-${tile.col * TILE_W}px -${tile.row * TILE_H}px`,
          }}
        />
      ))}
    </div>
  )
}

// cached after first load so replaying doesn't refetch
let countryCache = null

export default function Game() {
  const [guesses, setGuesses] = useState([])
  const [input, setInput] = useState("")
  const [won, setWon] = useState(false)
  const [lost, setLost] = useState(false)
  const [country, setCountry] = useState(null)
  const [countryList, setCountryList] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const startTime = useRef(Date.now())
  const submitted = useRef(false)
  const navigate = useNavigate()
  const location = useLocation();
  const is_daily = location.state?.is_daily || false;

useEffect(() => {
  const load = () => {
    try {
      const names = countryData.map(c => c.name).sort((a, b) => a.localeCompare(b));

      // check if we are in Daily Mode or Free Play
      let picked;
      if (is_daily) {
        picked = getDailyCountry();
      } else {
        picked = countryData[Math.floor(Math.random() * countryData.length)];
      }
      
      setCountry({
        ...picked,
        flagUrl: `https://flagcdn.com/w640/${picked.code.toLowerCase()}.png`
      });

      setCountryList(names);
      startTime.current = Date.now();
    } catch (err) {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };
  load();
}, [is_daily]);

  // filter countries as user types
  const handleInputChange = (e) => {
    const val = e.target.value
    setInput(val)
    setShowAll(false)
    if (val.length > 0) {
      const filtered = countryList.filter(c =>
        c.toLowerCase().startsWith(val.toLowerCase())
      )
      setSuggestions(filtered.slice(0, 5))
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  // set input to selected country and close suggestions
  const handleSelect = (country) => {
    setInput(country)
    setSuggestions([])
    setShowSuggestions(false)
  }

  // revealAmount increases with each guess
  // (0 = scattered, 1 = fully assembled)
  const revealAmount = won ? 1 : Math.min(1, guesses.length / MAX_GUESSES)

const sendResult = (didWin, guessCount) => {
  if (submitted.current) return;
  submitted.current = true;
  
  if (is_daily && didWin) {
    localStorage.setItem("last_daily_played", new Date().toISOString().split('T')[0]);
  }
  const time_taken = Math.round((Date.now() - startTime.current) / 1000);
  const score = didWin ? Math.max(0, (MAX_GUESSES - guessCount + 1) * 100) : 0;

  console.log("SUBMITTING STAGE 1. is_daily value is:", is_daily);
  submitGameResult({ 
    score, 
    stage: 1, 
    time_taken, 
    accuracy: didWin ? 100 : 0, 
    is_daily: is_daily // this ensures the DB knows if it's practice or daily
  })
  .then(() => {
    if (!is_daily) console.log("Practice result saved for Results display.");
  })
  .catch(err => console.error("failed to save game result", err));
  }

const handleGuess = () => {
  if (!input.trim() || won || lost) return
  if (!countryList.includes(input.trim())) return
  const correct = input.trim().toLowerCase() === country.name.toLowerCase()
  const newGuesses = [...guesses, { text: input, correct }]
  setGuesses(newGuesses)
  setInput("")
  setSuggestions([])

  if (correct) {
    setWon(true)
    sendResult(true, newGuesses.length)
    setTimeout(() => {
      navigate("/stage2", { 
        state: { 
          country: country.name, 
          flagUrl: `https://flagcdn.com/w640/${country.code.toLowerCase()}.png`, 
          code: country.code,
          capital: country.capital,
          is_daily: is_daily
        } 
      });
    }, 1500)
  } else if (newGuesses.length >= MAX_GUESSES) {
    setLost(true)
    sendResult(false, newGuesses.length)
    setTimeout(() => {
      navigate("/stage2", { 
        state: { 
          country: country.name, 
          flagUrl: country.flagUrl,
          is_daily: is_daily 
        } 
      })
    }, 1500)
  }
}

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-sm">Could not load game data.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-zinc-700 text-gray-200 rounded-lg hover:bg-zinc-600 text-sm"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center gap-7 px-4">
      
      <StarFieldBackground />
      
      
      <h1 className="text-3xl font-bold text-white drop-shadow-lg">Guess the Flag</h1>

      <div style={{ overflow: "hidden", width: FLAG_W, height: FLAG_H, borderRadius: 12 }}>
        <ScatterFlag src={country.flagUrl} revealAmount={revealAmount} />
      </div>

      <p className="text-gray-400 text-sm">{guesses.length} / {MAX_GUESSES} guesses</p>

      <div className="flex flex-col gap-2 w-full max-w-sm">
        {guesses.map((g, i) => (
          <div
            key={i}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border ${
              g.correct 
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                : "bg-white/[0.01] backdrop-blur-[4px] border-white/10 text-gray-300"
            }`}
          >
            {g.text}
          </div>
        ))}
      </div>

      {!won && !lost && (
        <div className="flex flex-col gap-2 w-full max-w-sm relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === "Enter" && handleGuess()}
                placeholder="Type a country..."
                className="w-full px-4 py-3 bg-white/[0.01] backdrop-blur-[4px] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
              {/* Dropdown arrow button */}
              <button
                onClick={() => {
                  setShowAll(!showAll)
                  setSuggestions([])
                  setShowSuggestions(false)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showAll ? "▲" : "▼"}
              </button>

              {/* Autocomplete suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white/[0.01] backdrop-blur-[4px] border border-white/10 rounded-lg mt-2 z-20 overflow-y-auto max-h-60 shadow-2xl">
                  {suggestions.map((country) => (
                    <div
                      key={country}
                      onClick={() => handleSelect(country)}
                      className="px-4 py-3 text-white hover:bg-white/10 cursor-pointer text-sm transition-colors border-b border-white/5 last:border-none"
                    >
                      {country}
                    </div>
                  ))}
                </div>
              )}

              {/* Full country list */}
              {showAll && (
                <div className="absolute top-full left-0 right-0 bg-white/[0.01] backdrop-blur-[4px] border border-white/10 rounded-lg mt-2 z-20 overflow-y-auto max-h-60 shadow-2xl">
                  {countryList.map((c) => (
                    <div
                      key={c}
                      onClick={() => {
                        handleSelect(c)
                        setShowAll(false)
                      }}
                      className="px-4 py-3 text-white hover:bg-white/20 cursor-pointer text-sm transition-colors border-b border-white/5 last:border-none"
                    >
                      {c}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleGuess}
              className="px-8 py-3 bg-emerald-500/[0.03] backdrop-blur-[4px] border border-emerald-500/40 text-emerald-400 font-bold uppercase tracking-wider rounded-lg transition-all hover:bg-emerald-500/20 hover:border-emerald-500/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.20)] active:scale-95"
            >
              Guess
            </button>
          </div>
        </div>
      )}

      {won && (
        <div className="text-center">
          <p className="text-emerald-400 text-2xl font-bold">Correct!</p>
          <p className="text-gray-400 mt-1">You got it in {guesses.length} guess{guesses.length !== 1 ? "es" : ""}!</p>
        </div>
      )}
      {lost && (
        <div className="text-center">
          <p className="text-red-400 text-2xl font-bold">Out of guesses!</p>
          <p className="text-gray-400 mt-1">The answer was <span className="text-white font-semibold">{country.name}</span></p>
        </div>
      )}
    </div>
  )
}