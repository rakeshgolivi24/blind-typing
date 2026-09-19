import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  ShieldAlert, 
  Send, 
  AlertOctagon, 
  Keyboard, 
  Eye, 
  EyeOff, 
  Delete,
  MousePointerClick,
  Zap,
  Target,
  FileText,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function TypingArenaPage({ 
  roundNumber, 
  isPractice = false, 
  practiceMode = 1,
  token, 
  onFinishRound, 
  onCancel,
  onChangePracticeMode
}) {
  const [roundData, setRoundData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Words array
  const [words, setWords] = useState([]);
  const wordsRef = useRef([]);

  // Keystroke state with Ref backing to prevent any stale closures
  const [typedWords, setTypedWords] = useState([]);
  const typedWordsRef = useRef([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const currentWordIndexRef = useRef(0);

  // Time tracking
  const startTimeRef = useRef(null);
  const [timeRemaining, setTimeRemaining] = useState(isPractice ? 60 : 120);
  const [elapsedDisplay, setElapsedDisplay] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(true);

  // Practice completion modal
  const [practiceResult, setPracticeResult] = useState(null);

  // Anti-cheat state (only for official contest rounds)
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const inputRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Load round prompt or practice prompt
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        setError('');

        let url = `/api/contest/round/${roundNumber}`;
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        if (isPractice) {
          url = `/api/contest/practice-prompt?mode=${practiceMode}`;
        }

        const res = await fetch(url, { headers });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to initialize arena');
        }

        if (isMounted) {
          const payload = isPractice ? data.practice : data.round;
          setRoundData(payload);

          const splitWords = (payload.text || '').trim().split(/\s+/);
          setWords(splitWords);
          wordsRef.current = splitWords;

          const initialTyped = new Array(splitWords.length).fill('');
          setTypedWords(initialTyped);
          typedWordsRef.current = initialTyped;

          currentWordIndexRef.current = 0;
          setCurrentWordIndex(0);

          const limit = payload.timeLimit || (isPractice ? 60 : 120);
          setTimeRemaining(limit);
          setElapsedDisplay(0);
          setSubmitting(false);
          setIsFocused(true);

          startTimeRef.current = Date.now();
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [roundNumber, isPractice, practiceMode, token]);

  // Keep input focused automatically
  useEffect(() => {
    if (!loading && roundData && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading, roundData]);

  // Countdown timer loop
  useEffect(() => {
    if (!roundData || loading || submitting || practiceResult) return;

    timerIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsedSec = Math.floor((now - (startTimeRef.current || now)) / 1000);
      setElapsedDisplay(elapsedSec);

      const limit = roundData.timeLimit || (isPractice ? 60 : 120);
      const remain = Math.max(0, limit - elapsedSec);
      setTimeRemaining(remain);

      if (remain <= 0) {
        clearInterval(timerIntervalRef.current);
        handleSubmit();
      }
    }, 1000);

    return () => clearInterval(timerIntervalRef.current);
  }, [roundData, loading, submitting, practiceResult]);

  // Anti-Cheat: Tab Visibility Listener (Only in official contest)
  useEffect(() => {
    if (isPractice) return;

    const handleVisibilityChange = () => {
      if (document.hidden && !submitting) {
        setTabSwitches((prev) => {
          const updated = prev + 1;
          if (updated === 1) {
            setShowWarningModal(true);
          } else if (updated >= 2) {
            handleSubmit();
          }
          return updated;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [submitting, isPractice]);

  // Process a key event (handles Space, Backspace, and Characters)
  const processKey = (e) => {
    if (loading || !roundData || submitting || showWarningModal || practiceResult) return;

    if (e._processed) return;
    e._processed = true;

    // Disallow cut/copy/paste
    if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a', 'z', 'y', 'u', 'i', 'j'].includes(e.key.toLowerCase())) {
      e.preventDefault();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      return;
    }

    const permissions = roundData.permissions;
    const wList = wordsRef.current;
    const cIdx = currentWordIndexRef.current;
    const currentWord = wList[cIdx] || '';
    const currentTyped = typedWordsRef.current[cIdx] || '';

    // 1. SPACE: Dynamic jump to next word
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      if (cIdx < wList.length - 1) {
        const nextIdx = cIdx + 1;
        currentWordIndexRef.current = nextIdx;
        setCurrentWordIndex(nextIdx);
      } else {
        handleSubmit();
      }
      return;
    }

    // 2. BACKSPACE / DELETE
    if (e.key === 'Backspace' || e.key === 'Delete') {
      if (!permissions.backspaceAllowed) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      if (currentTyped.length > 0) {
        const updated = [...typedWordsRef.current];
        updated[cIdx] = currentTyped.slice(0, -1);
        typedWordsRef.current = updated;
        setTypedWords(updated);
      }
      return;
    }

    // 3. REGULAR PRINTABLE CHARACTER KEY
    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      const char = e.key;

      const updated = [...typedWordsRef.current];
      updated[cIdx] = currentTyped + char;
      typedWordsRef.current = updated;
      setTypedWords(updated);
    }
  };

  // Global Key Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'BUTTON') return;
      processKey(e);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, roundData, submitting, showWarningModal, practiceResult]);

  // Submit Handler
  const handleSubmit = async () => {
    if (submitting) return;
    clearInterval(timerIntervalRef.current);
    setSubmitting(true);

    const now = Date.now();
    const actualSeconds = startTimeRef.current
      ? Math.max(1, Math.round((now - startTimeRef.current) / 1000))
      : Math.max(1, elapsedDisplay);

    const wList = wordsRef.current;
    const tList = typedWordsRef.current;
    const fullTypedText = wList
      .map((_, idx) => tList[idx] || '')
      .join(' ')
      .trim();

    // IF PRACTICE MODE: Compute locally and show practice review modal
    if (isPractice) {
      let correctChars = 0;
      let totalTyped = 0;
      for (let w = 0; w < wList.length; w++) {
        const oW = wList[w] || '';
        const tW = tList[w] || '';
        totalTyped += tW.length;
        const charLen = Math.min(oW.length, tW.length);
        for (let c = 0; c < charLen; c++) {
          if (oW[c] === tW[c]) correctChars++;
        }
        if (w < wList.length - 1 && tW.length > 0) {
          totalTyped++;
          correctChars++;
        }
      }
      const minutes = actualSeconds / 60;
      const wpm = Math.max(0, Math.round((correctChars / 5) / minutes));
      const accuracy = totalTyped > 0 ? Math.max(0, Math.min(100, Math.round((correctChars / totalTyped) * 1000) / 10)) : 0;

      setPracticeResult({
        wpm,
        accuracy,
        timeTakenSeconds: actualSeconds,
        totalChars: totalTyped,
        correctChars
      });
      setSubmitting(false);
      return;
    }

    // OFFICIAL CONTEST ROUND: Submit to API and persist in MongoDB Atlas
    try {
      const res = await fetch('/api/contest/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          roundNumber,
          typedText: fullTypedText,
          timeTakenSeconds: actualSeconds
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      onFinishRound(data.result);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  // Reset practice
  const handleRetryPractice = () => {
    setPracticeResult(null);
    const initialTyped = new Array(words.length).fill('');
    setTypedWords(initialTyped);
    typedWordsRef.current = initialTyped;
    currentWordIndexRef.current = 0;
    setCurrentWordIndex(0);
    setTimeRemaining(60);
    setElapsedDisplay(0);
    setSubmitting(false);
    startTimeRef.current = Date.now();
    if (inputRef.current) inputRef.current.focus();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-burgundy-700 border-t-gold-400 rounded-full animate-spin" />
        <p className="text-gray-300 text-sm font-medium">
          {isPractice ? 'Loading 1-Minute Practice Warm-Up...' : `Entering BCAlgorix Arena (Round ${roundNumber})...`}
        </p>
      </div>
    );
  }

  if (error && !roundData) {
    return (
      <div className="max-w-xl mx-auto my-16 p-6 bg-wine-card border border-red-800 rounded-2xl text-center">
        <AlertOctagon className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold font-fest text-white mb-2">Arena Notice</h2>
        <p className="text-sm text-gray-300 mb-6">{error}</p>
        <button
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl bg-wine-dark border border-wine-border hover:bg-wine-card text-white text-sm"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const permissions = roundData.permissions;
  const isMasked = permissions.maskAsterisk;
  const isBackspaceAllowed = permissions.backspaceAllowed;

  // Format MM:SS timer
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  // REAL-TIME METRICS CALCULATION (Deterministic & Continuous)
  let totalCharsTyped = 0;
  let liveCorrectChars = 0;
  let completedWordsCount = 0;

  for (let w = 0; w <= currentWordIndex && w < words.length; w++) {
    const oW = words[w] || '';
    const tW = typedWords[w] || '';
    totalCharsTyped += tW.length;

    const minLen = Math.min(oW.length, tW.length);
    for (let c = 0; c < minLen; c++) {
      if (oW[c] === tW[c]) liveCorrectChars++;
    }

    if (w < currentWordIndex) {
      if (tW.length > 0) {
        completedWordsCount++;
        totalCharsTyped++; // include committed space
        liveCorrectChars++; // matched space
      }
    }
  }

  const totalPromptChars = words.reduce((acc, w) => acc + w.length, 0) + Math.max(0, words.length - 1);
  const elapsedMinutes = Math.max(0.01, elapsedDisplay / 60);
  const liveWpm = elapsedDisplay >= 1 ? Math.round((liveCorrectChars / 5) / elapsedMinutes) : 0;
  const liveAccuracy = totalCharsTyped > 0
    ? Math.max(0, Math.min(100, Math.round((liveCorrectChars / totalCharsTyped) * 1000) / 10))
    : 100;

  return (
    <div 
      className="max-w-5xl mx-auto px-4 sm:px-6 py-4 no-select relative"
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
    >
      
      {/* REAL-TIME STICKY STATS NAV BAR: Stays at the top during scrolling! */}
      <div className="sticky top-20 z-40 bg-[#160205]/95 border border-burgundy-700/70 rounded-2xl p-3.5 sm:px-6 mb-4 backdrop-blur-md shadow-burgundy flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Mode / Round Tag */}
        <div className="flex items-center space-x-2.5">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
            isPractice 
              ? 'bg-amber-950 border border-gold-500 text-gold-300' 
              : 'bg-burgundy-900 border border-burgundy-600 text-gold-400'
          }`}>
            {isPractice ? `Practice Arena (M${practiceMode})` : `Round ${roundNumber}`}
          </span>
          <span className="text-xs text-gray-300 font-medium hidden sm:inline">
            {roundData.title}
          </span>
        </div>

        {/* Center: Live Stats Badges */}
        <div className="flex items-center space-x-4 sm:space-x-6 text-xs sm:text-sm font-mono-code">
          
          {/* Live Speed (WPM) */}
          <div className="flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-gold-400" />
            <span className="text-gray-400 hidden xs:inline">Speed:</span>
            <span className="font-extrabold text-gold-400 text-sm sm:text-base">
              {liveWpm} <span className="text-[10px] text-gray-400 font-normal">WPM</span>
            </span>
          </div>

          {/* Live Accuracy */}
          <div className="flex items-center space-x-1.5">
            <Target className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-400 hidden xs:inline">Acc:</span>
            <span className="font-extrabold text-emerald-400 text-sm sm:text-base">
              {liveAccuracy}%
            </span>
          </div>

          {/* Words Count */}
          <div className="flex items-center space-x-1.5 hidden sm:flex">
            <span className="text-gray-400">Words:</span>
            <span className="font-bold text-gray-200">
              {completedWordsCount} / {words.length}
            </span>
          </div>

          {/* Chars Count */}
          <div className="flex items-center space-x-1.5 hidden md:flex">
            <FileText className="w-4 h-4 text-sky-400" />
            <span className="text-gray-400">Chars:</span>
            <span className="font-bold text-gray-200">
              {totalCharsTyped} / {totalPromptChars}
            </span>
          </div>

        </div>

        {/* Right: Timer Countdown */}
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border ${
          timeRemaining < 20
            ? 'bg-red-950 border-red-500 text-red-400 animate-pulse'
            : 'bg-wine-dark border-wine-border text-gold-400'
        }`}>
          <Clock className="w-4 h-4" />
          <span className="font-mono-code font-bold text-base sm:text-lg">
            {formattedTime}
          </span>
        </div>

      </div>

      {/* PRACTICE MODE SELECTOR TABS (Only in Practice Arena) */}
      {isPractice && (
        <div className="flex flex-wrap items-center justify-between bg-wine-card/80 border border-wine-border/70 rounded-xl p-2.5 mb-4 gap-2">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-semibold text-gray-400 mr-1">Select Practice Mode:</span>
            <button
              onClick={() => onChangePracticeMode && onChangePracticeMode(1)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                practiceMode === 1
                  ? 'bg-burgundy-900 border border-gold-500 text-gold-300 shadow-sm'
                  : 'text-gray-400 hover:text-white bg-wine-dark border border-wine-border/60'
              }`}
            >
              Mode 1: Normal
            </button>
            <button
              onClick={() => onChangePracticeMode && onChangePracticeMode(2)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                practiceMode === 2
                  ? 'bg-burgundy-900 border border-gold-500 text-gold-300 shadow-sm'
                  : 'text-gray-400 hover:text-white bg-wine-dark border border-wine-border/60'
              }`}
            >
              Mode 2: Masked (*)
            </button>
            <button
              onClick={() => onChangePracticeMode && onChangePracticeMode(3)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                practiceMode === 3
                  ? 'bg-burgundy-900 border border-gold-500 text-gold-300 shadow-sm'
                  : 'text-gray-400 hover:text-white bg-wine-dark border border-wine-border/60'
              }`}
            >
              Mode 3: Extreme Blind (*)
            </button>
          </div>

          <button
            onClick={onCancel}
            className="text-xs text-gray-400 hover:text-white px-2 py-1 underline ml-auto"
          >
            Exit Practice
          </button>
        </div>
      )}

      {/* TYPING CANVAS: Monkeytype-style flowing layout */}
      <div 
        onClick={() => inputRef.current && inputRef.current.focus()}
        className="bg-[#140206] border border-burgundy-900/80 hover:border-burgundy-600/70 rounded-2xl p-6 sm:p-10 shadow-burgundy-lg min-h-[380px] relative transition-colors cursor-text select-none overflow-hidden"
      >
        
        {/* Invisible focus input */}
        <input
          ref={inputRef}
          type="text"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-auto cursor-text z-10"
          autoFocus
          spellCheck="false"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />

        {/* Unfocused Overlay */}
        {!isFocused && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-20 flex items-center justify-center pointer-events-none">
            <div className="px-5 py-2.5 rounded-xl bg-wine-card border border-gold-500/50 shadow-gold text-gold-300 text-sm font-semibold flex items-center gap-2 animate-pulse">
              <MousePointerClick className="w-4 h-4 text-gold-400" />
              <span>Click to focus and resume typing</span>
            </div>
          </div>
        )}

        {/* Mode Rules Banner */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-wine-border/40 text-xs text-gray-400 font-mono-code">
          <div className="flex items-center space-x-2 text-gold-400">
            <Keyboard className="w-4 h-4" />
            <span>
              {isMasked 
                ? "Masked (*) Typing. Characters are hidden. Press [Space] to commit word." 
                : "Visible Typing. Press [Space] to commit word."}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span>Word: {Math.min(currentWordIndex + 1, words.length)} / {words.length}</span>
          </div>
        </div>

        {/* THE WORDS STREAM: Past words show only typed letters. Current word shows typed + caret + remainder. */}
        <div className="font-mono text-xl sm:text-2xl leading-relaxed sm:leading-[2.2] tracking-wider flex flex-wrap gap-x-3.5 gap-y-3 items-center">
          {words.map((word, wIdx) => {
            const isCurrentWord = wIdx === currentWordIndex;
            const isPastWord = wIdx < currentWordIndex;
            const typedWord = typedWords[wIdx] || '';

            // 1. PAST WORD (Committed when user pressed Space):
            // Shows ONLY what the user typed (no trailing untyped letters!)
            if (isPastWord) {
              if (!typedWord) return null;

              return (
                <span key={wIdx} className="inline-flex items-center whitespace-nowrap">
                  {typedWord.split('').map((char, lIdx) => {
                    const displayChar = isMasked ? '*' : char;
                    return (
                      <span
                        key={lIdx}
                        className={`inline-block font-semibold ${
                          isMasked ? 'text-gold-400' : 'text-white'
                        }`}
                      >
                        {displayChar}
                      </span>
                    );
                  })}
                </span>
              );
            }

            // 2. CURRENT ACTIVE WORD:
            if (isCurrentWord) {
              const typedLen = typedWord.length;
              const promptLen = word.length;

              return (
                <span key={wIdx} className="inline-flex items-center relative whitespace-nowrap">
                  {/* Typed letters of current word */}
                  {typedWord.split('').map((char, lIdx) => {
                    const displayChar = isMasked ? '*' : char;
                    return (
                      <span
                        key={`typed-${lIdx}`}
                        className={`inline-block font-semibold ${
                          isMasked ? 'text-gold-400' : 'text-white'
                        }`}
                      >
                        {displayChar}
                      </span>
                    );
                  })}

                  {/* Vertical Caret Cursor */}
                  <span className="inline-block w-[2.5px] h-[1.25em] bg-gold-400 rounded-full animate-caret -ml-[1px] mr-[1px] shadow-gold align-middle" />

                  {/* Untyped remaining prompt characters */}
                  {typedLen < promptLen && (
                    word.slice(typedLen).split('').map((char, rIdx) => (
                      <span
                        key={`rem-${rIdx}`}
                        className="text-[#646669] font-medium"
                      >
                        {char}
                      </span>
                    ))
                  )}
                </span>
              );
            }

            // 3. FUTURE WORDS:
            return (
              <span key={wIdx} className="inline-flex items-center whitespace-nowrap">
                {word.split('').map((char, lIdx) => (
                  <span key={lIdx} className="text-[#646669] font-medium">
                    {char}
                  </span>
                ))}
              </span>
            );
          })}
        </div>

        {/* Helper Toolbar */}
        <div className="mt-8 pt-4 border-t border-wine-border/40 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-wine-card border border-wine-border font-mono text-gold-300 text-[11px] font-bold">
              SPACE
            </span>
            <span>Jump to next word at any time</span>
          </div>

          <span className="text-gray-400 font-mono-code">
            Elapsed: {elapsedDisplay}s
          </span>
        </div>

      </div>

      {/* Bottom Action Footer */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-400">
          {isPractice 
            ? "1-minute practice round. You can test your speed as many times as you like." 
            : "Contest attempt. Keystrokes are submitted to the official BCAlgorix leaderboard."}
        </p>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {isPractice ? (
            <button
              onClick={handleRetryPractice}
              className="px-5 py-3 rounded-xl bg-wine-card hover:bg-wine-cardHover border border-wine-border text-gray-200 text-sm font-semibold flex items-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4 text-gold-400" />
              <span>Reset Practice</span>
            </button>
          ) : null}

          <button
            onClick={handleSubmit}
            disabled={submitting || totalCharsTyped === 0}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-burgundy-700 via-burgundy-600 to-burgundy-700 hover:from-burgundy-600 hover:to-burgundy-500 text-white font-bold text-sm shadow-burgundy flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed z-20"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting...' : isPractice ? 'Finish Practice' : 'Finish & Submit Round'}</span>
          </button>
        </div>
      </div>

      {/* PRACTICE RESULT MODAL (For 1-minute practice sessions) */}
      {practiceResult && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-wine-card to-wine-dark border border-gold-500/70 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center shadow-gold relative">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-700 to-gold-500 border border-gold-400 shadow-gold mb-4">
              <Sparkles className="w-8 h-8 text-black" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-fest font-bold text-white mb-1">
              Practice Complete!
            </h2>
            <p className="text-xs uppercase tracking-widest text-gold-400 font-semibold mb-6">
              1-Minute Warm-Up Performance
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-wine-dark border border-wine-border rounded-2xl p-4">
                <span className="text-xs text-gray-400 block uppercase font-semibold">Speed</span>
                <span className="text-3xl font-mono-code font-extrabold text-gold-400">
                  {practiceResult.wpm}
                </span>
                <span className="text-[11px] text-gray-400 block mt-1">Words Per Minute</span>
              </div>

              <div className="bg-wine-dark border border-wine-border rounded-2xl p-4">
                <span className="text-xs text-gray-400 block uppercase font-semibold">Accuracy</span>
                <span className="text-3xl font-mono-code font-extrabold text-emerald-400">
                  {practiceResult.accuracy}%
                </span>
                <span className="text-[11px] text-gray-400 block mt-1">Precision</span>
              </div>

              <div className="bg-wine-dark border border-wine-border rounded-2xl p-4">
                <span className="text-xs text-gray-400 block uppercase font-semibold">Duration</span>
                <span className="text-2xl font-mono-code font-bold text-white">
                  {practiceResult.timeTakenSeconds}s
                </span>
                <span className="text-[11px] text-gray-400 block mt-1">Time Elapsed</span>
              </div>

              <div className="bg-wine-dark border border-wine-border rounded-2xl p-4">
                <span className="text-xs text-gray-400 block uppercase font-semibold">Characters</span>
                <span className="text-2xl font-mono-code font-bold text-white">
                  {practiceResult.totalChars}
                </span>
                <span className="text-[11px] text-gray-400 block mt-1">Total Typed</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRetryPractice}
                className="flex-1 py-3 px-4 rounded-xl bg-wine-card hover:bg-wine-cardHover border border-wine-border text-gray-200 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-gold-400" />
                <span>Practice Again</span>
              </button>

              <button
                onClick={onCancel}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-black font-bold text-sm shadow-gold"
              >
                <span>{token ? 'Go to Contest Arena' : 'Sign In for Contest'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Anti-Cheat Warning Modal (Contest Only) */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-wine-card border-2 border-red-700 rounded-2xl max-w-md w-full p-6 text-center shadow-burgundy-lg">
            <AlertOctagon className="w-14 h-14 text-red-500 mx-auto mb-3 animate-bounce" />
            <h3 className="text-xl font-fest font-bold text-white mb-2">
              Anti-Cheat Warning!
            </h3>
            <p className="text-xs sm:text-sm text-red-200 mb-4 leading-relaxed">
              Window focus lost or tab switch detected. In the <strong>BCAlgorix Blind Typing Championship</strong>, switching tabs is strictly forbidden.
            </p>
            <div className="p-3 bg-red-950/80 rounded-xl border border-red-800 text-xs text-red-300 font-semibold mb-5">
              Warning 1 of 1: Any subsequent tab switch will immediately auto-submit and lock your round!
            </div>
            <button
              onClick={() => {
                setShowWarningModal(false);
                if (inputRef.current) inputRef.current.focus();
              }}
              className="w-full py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-sm shadow-lg transition-colors"
            >
              I Understand - Resume Typing
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
