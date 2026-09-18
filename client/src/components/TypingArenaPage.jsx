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
  MousePointerClick
} from 'lucide-react';

export default function TypingArenaPage({ roundNumber, token, onFinishRound, onCancel }) {
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
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [elapsedDisplay, setElapsedDisplay] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(true);

  // Anti-cheat state
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const inputRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Load round prompt & initialize words
  useEffect(() => {
    let isMounted = true;
    async function loadRound() {
      try {
        setLoading(true);
        const res = await fetch(`/api/contest/round/${roundNumber}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to initialize round');
        }

        if (isMounted) {
          setRoundData(data.round);
          const splitWords = (data.round.text || '').trim().split(/\s+/);
          setWords(splitWords);
          wordsRef.current = splitWords;

          const initialTyped = new Array(splitWords.length).fill('');
          setTypedWords(initialTyped);
          typedWordsRef.current = initialTyped;

          currentWordIndexRef.current = 0;
          setCurrentWordIndex(0);

          setTimeRemaining(data.round.timeLimit || 120);
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

    loadRound();
    return () => { isMounted = false; };
  }, [roundNumber, token]);

  // Keep input focused so browser is always capturing keystrokes
  useEffect(() => {
    if (!loading && roundData && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading, roundData]);

  // Countdown timer loop
  useEffect(() => {
    if (!roundData || loading || submitting) return;

    timerIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsedSec = Math.floor((now - (startTimeRef.current || now)) / 1000);
      setElapsedDisplay(elapsedSec);

      const limit = roundData.timeLimit || 120;
      const remain = Math.max(0, limit - elapsedSec);
      setTimeRemaining(remain);

      if (remain <= 0) {
        clearInterval(timerIntervalRef.current);
        handleSubmit();
      }
    }, 1000);

    return () => clearInterval(timerIntervalRef.current);
  }, [roundData, loading, submitting]);

  // Anti-Cheat: Tab Visibility Listener
  useEffect(() => {
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
  }, [submitting]);

  // Process a key event (handles Space, Backspace, and Characters)
  const processKey = (e) => {
    if (loading || !roundData || submitting || showWarningModal) return;

    // Prevent duplicate processing of the same event
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

    // 1. SPACE: Dynamic jump to the next word!
    // "if he misses any letter or symbols it doesnt matter when he click space it dynamically moves to the next word"
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      // Move to next word if not at last word
      if (cIdx < wList.length - 1) {
        const nextIdx = cIdx + 1;
        currentWordIndexRef.current = nextIdx;
        setCurrentWordIndex(nextIdx);
      } else {
        // If on the last word and user presses space, submit
        handleSubmit();
      }
      return;
    }

    // 2. BACKSPACE / DELETE
    // Round 1: Allowed
    // Round 2: Allowed
    // Round 3: BLOCKED!
    if (e.key === 'Backspace' || e.key === 'Delete') {
      if (!permissions.backspaceAllowed) {
        // Blocked in Round 3
        e.preventDefault();
        return;
      }

      e.preventDefault();
      // If current word has typed characters, erase last character
      if (currentTyped.length > 0) {
        const updated = [...typedWordsRef.current];
        updated[cIdx] = currentTyped.slice(0, -1);
        typedWordsRef.current = updated;
        setTypedWords(updated);
      }
      // Once space is clicked, there is NO going back to previous word!
      return;
    }

    // 3. REGULAR PRINTABLE CHARACTER KEY
    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      const char = e.key;

      // Allow user to enter letters freely without stopping extra letters
      const updated = [...typedWordsRef.current];
      updated[cIdx] = currentTyped + char;
      typedWordsRef.current = updated;
      setTypedWords(updated);
    }
  };

  // SINGLE Global key listener: Guarantees every single keystroke is captured exactly once
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if clicking an actual button
      if (e.target.tagName === 'BUTTON') return;
      processKey(e);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, roundData, submitting, showWarningModal]);

  // Submit Handler: Ref-backed to guarantee 100% accurate data
  const handleSubmit = async () => {
    if (submitting) return;
    clearInterval(timerIntervalRef.current);
    setSubmitting(true);

    // Calculate actual elapsed duration in seconds
    const now = Date.now();
    const actualSeconds = startTimeRef.current
      ? Math.max(1, Math.round((now - startTimeRef.current) / 1000))
      : Math.max(1, elapsedDisplay);

    // Reconstruct full typed string from typedWordsRef
    const wList = wordsRef.current;
    const tList = typedWordsRef.current;
    const fullTypedText = wList
      .map((_, idx) => tList[idx] || '')
      .join(' ')
      .trim();

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

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-burgundy-700 border-t-gold-400 rounded-full animate-spin" />
        <p className="text-gray-300 text-sm font-medium">
          Entering BCAlgorix Arena (Round {roundNumber})...
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
  const isMasked = permissions.maskAsterisk; // Round 2 & 3: true; Round 1: false
  const isBackspaceAllowed = permissions.backspaceAllowed; // Round 1 & 2: true; Round 3: false

  // Format MM:SS timer
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  // Count characters typed
  const totalCharsTyped = typedWords.reduce((acc, w) => acc + (w ? w.length : 0), 0);
  const totalPromptChars = words.reduce((acc, w) => acc + w.length, 0);

  return (
    <div 
      className="max-w-5xl mx-auto px-4 sm:px-6 py-6 no-select relative"
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
    >
      
      {/* Top Header Bar */}
      <div className="bg-wine-card/95 border border-wine-border rounded-2xl p-4 sm:p-5 mb-6 shadow-burgundy flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs uppercase tracking-widest font-bold text-gold-400">
              BCAlgorix Contest Arena
            </span>
            <span className="text-gray-600">•</span>
            <span className="text-xs text-gray-400 font-mono-code">
              Round {roundNumber} of 3
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-fest font-bold text-white tracking-wide">
            {roundData.title}
          </h1>
        </div>

        {/* Live Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Masking Badge */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${
            isMasked
              ? 'bg-burgundy-950/90 border-burgundy-600 text-gold-300 shadow-sm'
              : 'bg-wine-dark border-wine-border text-gray-200'
          }`}>
            {isMasked ? <EyeOff className="w-3.5 h-3.5 text-gold-400" /> : <Eye className="w-3.5 h-3.5 text-gray-300" />}
            <span>{isMasked ? 'Masked (*)' : 'Visible Keystrokes'}</span>
          </span>

          {/* Backspace Badge */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${
            isBackspaceAllowed
              ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300'
              : 'bg-red-950/80 border-red-700 text-red-300 font-bold'
          }`}>
            <Delete className="w-3.5 h-3.5" />
            <span>{isBackspaceAllowed ? 'Backspace ON' : 'Backspace BLOCKED'}</span>
          </span>

          {/* Anti-Cheat Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-wine-dark border border-wine-border text-gray-300">
            <ShieldAlert className="w-3.5 h-3.5 text-burgundy-400" />
            <span>Anti-Cheat Guard</span>
          </span>
        </div>

        {/* Live Timer */}
        <div className={`flex items-center space-x-2.5 px-4 py-2 rounded-xl border ${
          timeRemaining < 30
            ? 'bg-red-950/90 border-red-500 text-red-300 animate-pulse'
            : 'bg-wine-dark border-wine-border text-gold-400'
        }`}>
          <Clock className="w-5 h-5 flex-shrink-0" />
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider block text-gray-400 leading-none">
              Time Left
            </span>
            <span className="text-2xl font-mono-code font-bold tracking-wider leading-tight">
              {formattedTime}
            </span>
          </div>
        </div>

      </div>

      {/* MONKEYTYPE-INSPIRED TYPING CANVAS */}
      <div 
        onClick={() => inputRef.current && inputRef.current.focus()}
        className="bg-[#140206] border border-burgundy-900/80 hover:border-burgundy-600/70 rounded-2xl p-6 sm:p-10 shadow-burgundy-lg min-h-[380px] relative transition-colors cursor-text select-none overflow-hidden"
      >
        
        {/* Invisible capture input covering the entire canvas to retain focus */}
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

        {/* Unfocused Blur Overlay Reminder */}
        {!isFocused && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-20 flex items-center justify-center pointer-events-none">
            <div className="px-5 py-2.5 rounded-xl bg-wine-card border border-gold-500/50 shadow-gold text-gold-300 text-sm font-semibold flex items-center gap-2 animate-pulse">
              <MousePointerClick className="w-4 h-4 text-gold-400" />
              <span>Click to focus and resume typing</span>
            </div>
          </div>
        )}

        {/* Top Mini Header: Progress counter */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-wine-border/40 text-xs text-gray-400 font-mono-code">
          <div className="flex items-center space-x-2 text-gold-400">
            <Keyboard className="w-4 h-4" />
            <span>
              {roundNumber === 1 && "Mode: Visible Typing (Press Space to advance words)"}
              {roundNumber === 2 && "Mode: Semi-Blind (*) Typing (Backspace allowed)"}
              {roundNumber === 3 && "Mode: Championship Blind (*) Gauntlet (Backspace locked)"}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span>Word: {Math.min(currentWordIndex + 1, words.length)} / {words.length}</span>
            <span>•</span>
            <span>Chars: {totalCharsTyped} / {totalPromptChars}</span>
          </div>
        </div>

        {/* THE WORDS STREAM: Flowing text with fixed letters & vertical caret cursor */}
        <div className="font-mono text-xl sm:text-2xl leading-relaxed sm:leading-[2.2] tracking-wider flex flex-wrap gap-x-3.5 gap-y-3 items-center">
          {words.map((word, wIdx) => {
            const isCurrentWord = wIdx === currentWordIndex;
            const isPastWord = wIdx < currentWordIndex;
            const typedWord = typedWords[wIdx] || '';

            // 1. PAST WORD: User clicked Space and committed this word.
            // Render ONLY what the user typed (half word, exact word, or extra letters).
            // The remaining untyped letters of the prompt word are completely omitted.
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
            // Renders typed characters (plus any extra characters), the caret line, and the remaining prompt letters.
            if (isCurrentWord) {
              const typedLen = typedWord.length;
              const promptLen = word.length;

              return (
                <span key={wIdx} className="inline-flex items-center relative whitespace-nowrap">
                  {/* Typed characters of current word */}
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

                  {/* Vertical blinking caret cursor */}
                  <span className="inline-block w-[2.5px] h-[1.25em] bg-gold-400 rounded-full animate-caret -ml-[1px] mr-[1px] shadow-gold align-middle" />

                  {/* Untyped remaining prompt characters of this word (if any) */}
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
            // Full prompt word in clear muted color
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

        {/* Bottom Helper Bar */}
        <div className="mt-8 pt-4 border-t border-wine-border/40 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-wine-card border border-wine-border font-mono text-gold-300 text-[11px] font-bold">
              SPACE
            </span>
            <span>Jump to next word at any time</span>
          </div>

          <span className="text-gray-400 font-mono-code">
            Elapsed Time: {elapsedDisplay}s
          </span>
        </div>

      </div>

      {/* Bottom Actions Bar */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-400">
          Typing registers immediately. When finished with your attempt, submit below.
        </p>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={handleSubmit}
            disabled={submitting || totalCharsTyped === 0}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-burgundy-700 via-burgundy-600 to-burgundy-700 hover:from-burgundy-600 hover:to-burgundy-500 text-white font-bold text-sm shadow-burgundy flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed z-20"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting Attempt...' : 'Finish & Submit Round'}</span>
          </button>
        </div>
      </div>

      {/* Anti-Cheat Warning Modal */}
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
