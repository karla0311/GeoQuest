import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StarFieldBackground from "../components/Backgrounds/StarFieldBackground";

const Stage3Capital = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]); 
  const [currentGuess, setCurrentGuess] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  
  // tracking letter statuses for the keyboard colors
  const [letterStatuses, setLetterStatuses] = useState({}); 

  // data extraction
  const countryData = state?.country?.country ? state.country : (state?.country || state || {});
  const countryName = countryData.country || countryData.name || "the country";
  const rawCapital = (countryData.capital || "").toUpperCase().replace(/\s/g, '');
  const flagUrl = countryData.flagUrl;

  const MAX_ATTEMPTS = 6;
  const wordLength = rawCapital.length;

  const QWERTY = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"]
  ];

  // helper function to calculate statuses for a single row (handles duplicate letters correctly)
  const getRowStatuses = useCallback((guess) => {
    const statuses = Array(wordLength).fill("absent");
    const solutionArr = rawCapital.split('');
    const guessArr = [...guess];

    // first pass: find correct spots (green)
    guessArr.forEach((char, i) => {
      if (char === solutionArr[i]) {
        statuses[i] = "correct";
        solutionArr[i] = null; // mark as used
        guessArr[i] = null;    // mark as handled
      }
    });

    // second pass: find present letters (yellow)
    guessArr.forEach((char, i) => {
      if (char && solutionArr.includes(char)) {
        statuses[i] = "present";
        solutionArr[solutionArr.indexOf(char)] = null; // mark as used
      }
    });

    return statuses;
  }, [rawCapital, wordLength]);

  const handleAddLetter = useCallback((letter) => {
    const l = letter.toUpperCase();
    if (/^[A-Z]$/.test(l)) {
      setCurrentGuess(prev => {
        if (prev.length < wordLength && !isGameOver) {
          return [...prev, l];
        }
        return prev;
      });
    }
  }, [wordLength, isGameOver]);

  const handleBackspace = useCallback(() => {
    setCurrentGuess(prev => prev.slice(0, -1));
  }, []);

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== wordLength || isGameOver) return;

    // get statuses for this specific guess
    const rowStatuses = getRowStatuses(currentGuess);
    const newAttempts = [...attempts, { guess: currentGuess, statuses: rowStatuses }];
    
    // update keyboard letter statuses
    const newStatuses = { ...letterStatuses };
    currentGuess.forEach((char, index) => {
      const status = rowStatuses[index];
      if (status === 'correct') {
        newStatuses[char] = 'correct';
      } else if (status === 'present' && newStatuses[char] !== 'correct') {
        newStatuses[char] = 'present';
      } else if (status === 'absent' && !newStatuses[char]) {
        newStatuses[char] = 'absent';
      }
    });

    setLetterStatuses(newStatuses);
    setAttempts(newAttempts);
    setCurrentGuess([]);

    const guessString = currentGuess.join('');
    if (guessString === rawCapital) {
      setIsGameOver(true);
      setTimeout(() => navigate("/results", { state: { won: true, score: (state?.score || 0) + 250 } }), 2000);
    } else if (newAttempts.length >= MAX_ATTEMPTS) {
      setIsGameOver(true);
      setTimeout(() => navigate("/results", { state: { won: false, answer: rawCapital } }), 2000);
    }
  }, [currentGuess, wordLength, isGameOver, attempts, getRowStatuses, letterStatuses, rawCapital, navigate, state?.score]);

  // handle physical keyboard input
  useEffect(() => {
    const onKeyDown = (e) => {
      if (isGameOver) return;
      if (e.key === 'Enter') {
        submitGuess();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else {
        handleAddLetter(e.key);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleAddLetter, handleBackspace, submitGuess, isGameOver]);

  const getKeyStyle = (letter) => {
    const status = letterStatuses[letter];
    if (status === 'correct') return "bg-emerald-500 text-white border-transparent";
    if (status === 'present') return "bg-yellow-500 text-white border-transparent";
    if (status === 'absent') return "bg-zinc-900 text-zinc-600 border-transparent opacity-50";
    return "bg-zinc-800 text-white border-white/10 hover:bg-zinc-700";
  };

  if (!rawCapital) return <div className="min-h-screen bg-zinc-900" />;

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center gap-6 py-10 px-4">
      <StarFieldBackground />
      
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white uppercase tracking-widest">Capital Wordle</h1>
        <p className="text-gray-400">What is the capital of <span className="text-emerald-400 font-bold">{countryName}</span>?</p>
      </div>

      {flagUrl && <img src={flagUrl} alt="flag" className="w-24 shadow-lg rounded border border-white/10" />}

      {/* Wordle Grid */}
      <div className="flex flex-col gap-2">
        {[...Array(MAX_ATTEMPTS)].map((_, rowIndex) => {
          const isCurrentRow = rowIndex === attempts.length;
          const isPastRow = rowIndex < attempts.length;
          const rowData = isPastRow ? attempts[rowIndex].guess : (isCurrentRow ? currentGuess : []);
          const rowStatuses = isPastRow ? attempts[rowIndex].statuses : [];

          return (
            <div key={rowIndex} className="flex gap-2">
              {[...Array(wordLength)].map((_, colIndex) => {
                const char = rowData[colIndex] || "";
                let statusClass = "bg-white/5 border-white/10 text-white";
                
                if (isPastRow) {
                  const status = rowStatuses[colIndex];
                  if (status === "correct") statusClass = "bg-emerald-500 border-emerald-600 text-white";
                  else if (status === "present") statusClass = "bg-yellow-500 border-yellow-600 text-white";
                  else statusClass = "bg-zinc-700 border-zinc-800 text-zinc-400";
                } else if (isCurrentRow && char) {
                  statusClass = "bg-white/10 border-white/30 text-white scale-105";
                }

                return (
                  <div key={colIndex} className={`w-9 h-11 flex items-center justify-center border-2 rounded font-bold text-lg transition-all duration-500 ${statusClass}`}>
                    {char}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* QWERTY Keyboard */}
      {!isGameOver && (
        <div className="flex flex-col items-center gap-2 mt-2 w-full max-w-md">
          {QWERTY.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1 justify-center w-full">
              {row.map((letter) => (
                <button
                  key={letter}
                  type="button"
                  onClick={() => handleAddLetter(letter)}
                  className={`flex-1 max-w-[40px] h-12 rounded font-bold transition-all text-sm sm:text-base border ${getKeyStyle(letter)}`}
                >
                  {letter}
                </button>
              ))}
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-4 w-full justify-center">
            <button 
              onClick={handleBackspace}
              className="px-8 py-3 bg-red-500/20 text-red-400 border border-red-500/40 rounded font-bold hover:bg-red-500/30 transition-colors uppercase tracking-widest text-xs"
            >
              Delete
            </button>
            <button 
              onClick={submitGuess}
              disabled={currentGuess.length !== wordLength}
              className={`px-8 py-3 rounded font-bold transition-all uppercase tracking-widest text-xs ${
                currentGuess.length === wordLength 
                ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
                : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
              }`}
            >
              Enter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stage3Capital;