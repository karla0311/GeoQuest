import { useState, useEffect, useRef } from "react"
import { submitGameResult } from "../api/gameService"

// number of tile columns and rows (more = smaller tiles)
const COLS = 55
const ROWS = 33
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

export default function Game() {
  const testFlag = "https://flagcdn.com/w640/fr.png" // test flag
  const [guesses, setGuesses] = useState([])
  const [input, setInput] = useState("")
  const [won, setWon] = useState(false)
  const [lost, setLost] = useState(false)
  const answer = "France" // test answer
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const startTime = useRef(Date.now())
  const submitted = useRef(false)

  const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia",
    "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
    "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina",
    "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia",
    "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China",
    "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus",
    "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
    "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini",
    "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany",
    "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
    "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq",
    "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya",
    "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
    "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia",
    "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
    "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique",
    "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua",
    "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan",
    "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
    "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis",
    "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
    "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles",
    "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
    "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan",
    "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania",
    "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia",
    "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
    "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
    "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
  ]

  // filter countries as user types
  const handleInputChange = (e) => {
    const val = e.target.value
    setInput(val)
    setShowAll(false)
    if (val.length > 0) {
      const filtered = countries.filter(c =>
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

  // sends result once per game so a refresh after winning doesn't double-insert
  const sendResult = (didWin, guessCount) => {
    if (submitted.current) return
    submitted.current = true
    const time_taken = Math.round((Date.now() - startTime.current) / 1000)
    const score = didWin ? Math.max(0, (MAX_GUESSES - guessCount + 1) * 100) : 0
    submitGameResult({ score, stage: 1, time_taken, accuracy: didWin ? 100 : 0 })
      .catch(err => console.error("failed to save game result", err))
  }

  const handleGuess = () => {
    if (!input.trim() || won || lost) return
    if (!countries.includes(input.trim())) return
    const correct = input.trim().toLowerCase() === answer.toLowerCase()
    const newGuesses = [...guesses, { text: input, correct }]
    setGuesses(newGuesses)
    setInput("")
    setSuggestions([])
    if (correct) {
      setWon(true)
      sendResult(true, newGuesses.length)
    } else if (newGuesses.length >= MAX_GUESSES) {
      setLost(true)
      sendResult(false, newGuesses.length)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center gap-8 px-4">
      <h1 className="text-3xl font-bold text-white">Guess the Flag</h1>

      <div style={{ overflow: "hidden", width: FLAG_W, height: FLAG_H, borderRadius: 12 }}>
        <ScatterFlag src={testFlag} revealAmount={revealAmount} />
      </div>

      <p className="text-gray-400 text-sm">{guesses.length} / {MAX_GUESSES} guesses</p>

      <div className="flex flex-col gap-2 w-full max-w-sm">
        {guesses.map((g, i) => (
          <div
            key={i}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              g.correct ? "bg-emerald-700 text-white" : "bg-zinc-700 text-gray-300"
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
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-700"
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
                <div className="absolute top-full left-0 right-0 bg-zinc-800 border border-zinc-600 rounded-lg mt-1 z-10 overflow-hidden">
                  {suggestions.map((country) => (
                    <div
                      key={country}
                      onClick={() => handleSelect(country)}
                      className="px-4 py-2 text-gray-200 hover:bg-zinc-700 cursor-pointer text-sm"
                    >
                      {country}
                    </div>
                  ))}
                </div>
              )}

              {/* Full country list */}
              {showAll && (
                <div className="absolute top-full left-0 right-0 bg-zinc-800 border border-zinc-600 rounded-lg mt-1 z-10 overflow-y-auto max-h-48">
                  {countries.map((country) => (
                    <div
                      key={country}
                      onClick={() => {
                        handleSelect(country)
                        setShowAll(false)
                      }}
                      className="px-4 py-2 text-gray-200 hover:bg-zinc-700 cursor-pointer text-sm"
                    >
                      {country}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleGuess}
              className="px-6 py-3 bg-emerald-700 text-white rounded-lg hover:bg-emerald-600"
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
          <p className="text-gray-400 mt-1">The answer was <span className="text-white font-semibold">{answer}</span></p>
        </div>
      )}
    </div>
  )
}