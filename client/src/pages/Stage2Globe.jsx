import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import Globe from "react-globe.gl"
import { submitGameResult } from "../api/gameService"
import StarFieldBackground from "../components/Backgrounds/StarFieldBackground"

const MAX_GUESSES = 6

const getBearing = (fromLat, fromLon, toLat, toLon) => {
  const dLon = toLon - fromLon
  const dLat = toLat - fromLat
  const angle = Math.atan2(dLon, dLat) * (180 / Math.PI)
  return (angle + 360) % 360
}

const getCentroid = (feature) => {
  const lat = feature.properties.LABEL_Y
  const lon = feature.properties.LABEL_X
  if (lat != null && lon != null) return { lat, lon }
  const coords = feature.geometry.type === "Polygon"
    ? feature.geometry.coordinates[0]
    : feature.geometry.coordinates[0][0]
  const lons = coords.map(c => c[0])
  const lats = coords.map(c => c[1])
  return {
    lon: (Math.min(...lons) + Math.max(...lons)) / 2,
    lat: (Math.min(...lats) + Math.max(...lats)) / 2,
  }
}

export default function Stage2Globe() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const is_daily = state?.is_daily || false;
  const globeRef = useRef()
  const answerFeatureRef = useRef(null)

  const [countries, setCountries] = useState({ features: [] })
  const [hovered, setHovered] = useState(null)
  const [guesses, setGuesses] = useState([])
  const [done, setDone] = useState(false)
  const [won, setWon] = useState(false)
  const submitted = useRef(false)
  const startTime = useRef(Date.now())

  useEffect(() => {
    if (!state?.country) navigate("/game")
  }, [state, navigate])

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson")
      .then(r => r.json())
      .then(setCountries)
  }, [])

  // store answer feature in a ref so click handler always has current value
  useEffect(() => {
    if (!countries.features.length || !state?.code) return

  const match = countries.features.find(f => {
    return f.properties.ISO_A2?.toUpperCase() === state.code.toUpperCase()
  })
  answerFeatureRef.current = match ?? null
}, [countries, state])

  // point globe at answer country on load
useEffect(() => {
  if (!countries.features.length || !state?.country) return;

  const targetName = state.country.toLowerCase();
  const targetCode = state.code?.toLowerCase();

  const match = countries.features.find(f => {
    const props = f.properties;
    return (
      props.ISO_A2?.toLowerCase() === targetCode ||
      props.NAME?.toLowerCase() === targetName ||
      props.NAME_LONG?.toLowerCase() === targetName
    );
  });

  answerFeatureRef.current = match ?? null;

  if (!match) {
    console.error("Match failed for:", state.country, state.code);
  }
}, [countries, state]);

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().minDistance = 150
      globeRef.current.controls().maxDistance = 900
    }
  }, [countries])

  const saveResult = (didWin, guessCount) => {
    if (submitted.current) return;
    submitted.current = true;
    const time_taken = Math.round((Date.now() - startTime.current) / 1000);
    const score = didWin ? Math.max(0, (MAX_GUESSES - guessCount + 1) * 100) : 0;
    
    submitGameResult({ 
      score, 
      stage: 2, 
      time_taken, 
      accuracy: didWin ? 100 : 0, 
      is_daily: is_daily 
    }).catch(err => console.error("failed to save stage 2 result", err));
  };

  const handleCountryClick = (polygon) => {
    if (!polygon || done || !answerFeatureRef.current) return;

    const polyProps = polygon.properties;
    const targetName = state.country.toLowerCase();
    const targetCode = state.code?.toLowerCase();

    // prevent duplicate guesses of the same country
    if (guesses.some(g => g.feature.properties.NAME === polyProps.NAME)) return;

    const isCorrect = 
      polyProps.ISO_A2?.toLowerCase() === targetCode ||
      polyProps.NAME?.toLowerCase() === targetName ||
      polyProps.NAME_LONG?.toLowerCase() === targetName;

    if (isCorrect) {
      const finalGuesses = [...guesses, { feature: polygon, correct: true }];
      setGuesses(finalGuesses);
      setWon(true);
      setDone(true);
      saveResult(true, finalGuesses.length);
      setTimeout(() => {
        navigate("/stage3", { 
          state: { 
          name: state.country || state.name, 
          capital: state.capital,
          flagUrl: state.flagUrl,
          code: state.code,
          is_daily: is_daily,
            score: (state.score || 0) + 100
          } 
        });
      }, 2000);
      return;
    }

    // handle Wrong Guess
    const guessCentroid = getCentroid(polygon);
    const answerCentroid = getCentroid(answerFeatureRef.current);
    const bearing = getBearing(guessCentroid.lat, guessCentroid.lon, answerCentroid.lat, answerCentroid.lon);
    
    // create the updated array explicitly
    const updatedGuesses = [...guesses, { feature: polygon, bearing, correct: false }];
    setGuesses(updatedGuesses);

    // check for Game Over using the updated array
    if (updatedGuesses.length >= MAX_GUESSES) {
      setDone(true);
      setWon(false);
      saveResult(false, updatedGuesses.length);
      setTimeout(() => navigate("/results", { state: { is_daily: is_daily } }), 2500);
    }
  }

  const getPolygonColor = (polygon) => {
    const isAnswer =
      polygon.properties.NAME?.toLowerCase() === state?.country?.toLowerCase() ||
      polygon.properties.NAME_LONG?.toLowerCase() === state?.country?.toLowerCase()

    if (done && isAnswer) return "rgba(16, 185, 129, 0.85)"

    const guess = guesses.find(g => g.feature.properties.NAME === polygon.properties.NAME)
    if (guess && !guess.correct) return "rgba(239, 68, 68, 0.6)"

    if (polygon === hovered && !done) return "rgba(100, 116, 139, 0.7)"

    return "rgba(30, 41, 59, 0.6)"
  }

  const lastGuess = guesses.filter(g => !g.correct).at(-1)

  if (!state?.country) return null

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center gap-5 px-4">

      <StarFieldBackground />

      {/* Header */}
      <div className="flex flex-col items-center gap-2">
        <img src={state.flagUrl} alt="flag" className="h-12 rounded shadow" />
        <h1 className="text-2xl font-bold text-white">{state.country}</h1>
        {!done && <p className="text-gray-400 text-sm">Click the country on the globe</p>}
        {done && won && <p className="text-emerald-400 font-semibold text-lg">Correct!</p>}
        {done && !won && <p className="text-red-400 font-semibold text-lg">Out of guesses! The answer is highlighted.</p>}
      </div>

      {/* Guess counter */}
      <p className="text-gray-400 text-sm">{guesses.length} / {MAX_GUESSES} guesses</p>

      {/* Globe */}
      <div style={{ borderRadius: "50%", overflow: "hidden", width: 520, height: 520 }}>
        <Globe
          ref={globeRef}
          width={520}
          height={520}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          polygonsData={countries.features}
          polygonAltitude={d => d === hovered ? 0.025 : 0.006}
          polygonCapColor={getPolygonColor}
          polygonSideColor={() => "rgba(255,255,255,0.04)"}
          polygonStrokeColor={() => "rgba(255,255,255,0.12)"}
          polygonLabel={() => ""}
          onPolygonClick={handleCountryClick}
          onPolygonHover={setHovered}
        />
      </div>

      {/* Latest hint arrow */}
      {lastGuess && !done && (
        <div className="flex flex-col items-center gap-">
          <p className="text-gray-400 text-sm">
            <span className="text-white font-medium">{lastGuess.feature.properties.NAME}</span>
          </p>

          <div 
            style={{ 
              transform: `rotate(${lastGuess.bearing}deg)`, 
              display: "inline-block", 
              lineHeight: 1 
            }}
            className="rounded-full bg-white/[0.03] backdrop-blur-[4px] border border-white/10 p-0 overflow-hidden"
          >
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="block">

              <circle cx="36" cy="36" r="36" fill="transparent" />
              <path d="M36 12 L54 38 H43 V60 H29 V38 H18 Z" fill="rgba(255, 255, 255, 0.8)"/>
            </svg>
          </div>
        </div>
      )}

      {/* Guess history */}
      {guesses.length > 0 && (
        <div className="flex flex-col gap-2 w-full max-w-sm">
          {guesses.map((g, i) => (
            <div
              key={i}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex justify-between items-center ${
              g.correct 
            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
            : "bg-white/[0.01] backdrop-blur-[4px] border border-white/10 text-gray-300"
              }`}
            >
              <span>{g.feature.properties.NAME}</span>
              {g.correct ? <span>✓</span> : (
                <div style={{ transform: `rotate(${g.bearing}deg)`, fontSize: 20, display: "inline-block", lineHeight: 1 }}>
                  ↑
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}