import React from 'react';
import { 
  Play, 
  CheckCircle, 
  Lock, 
  Clock, 
  Zap, 
  Target, 
  ShieldCheck, 
  AlertTriangle, 
  Coffee,
  Trophy,
  ChevronRight
} from 'lucide-react';

export default function DashboardPage({ user, onStartRound, onStartPractice, onViewLeaderboard }) {
  const completedRounds = user?.roundsCompleted || [];
  const submissions = user?.submissions || [];

  // Round metadata
  const rounds = [
    {
      roundNumber: 1,
      title: "Round 1: Speed & Mechanics",
      badge: "Warm-up Phase",
      timeLimit: "2 Minutes (120s)",
      difficulty: "Introductory",
      rules: [
        { label: "Visible Characters", allowed: true },
        { label: "Backspace Allowed", allowed: true },
        { label: "Zero Error Clues", allowed: true, note: "No red/green indicators" },
        { label: "Copy / Paste Blocked", allowed: false }
      ],
      description: "Get acclimated to the arena. Full text visibility with backspace correction enabled."
    },
    {
      roundNumber: 2,
      title: "Round 2: Semi-Blind Precision",
      badge: "Semi-Blind Phase",
      timeLimit: "2.5 Minutes (150s)",
      difficulty: "Advanced",
      rules: [
        { label: "Typed Text Masked as (*)", allowed: true, note: "Letters turn into asterisks" },
        { label: "Backspace Allowed", allowed: true, note: "You can erase blind keystrokes" },
        { label: "Zero Error Clues", allowed: true, note: "Mistakes remain hidden" },
        { label: "Copy / Paste Blocked", allowed: false }
      ],
      description: "Step into the shadows. Keystrokes transform into asterisks (*) upon typing."
    },
    {
      roundNumber: 3,
      title: "Round 3: Extreme Blind Gauntlet",
      badge: "Championship Gauntlet",
      timeLimit: "3 Minutes (180s)",
      difficulty: "Grand Master",
      rules: [
        { label: "Typed Text Masked as (*)", allowed: true, note: "Pure blind execution" },
        { label: "Backspace BLOCKED", allowed: false, note: "Zero retraction or editing" },
        { label: "Zero Error Clues", allowed: true, note: "Total sensory typing" },
        { label: "Copy / Paste Blocked", allowed: false }
      ],
      description: "The ultimate trial. All keystrokes masked as (*), backspaces strictly locked."
    }
  ];

  // Helper to get submission for a specific round
  const getSub = (rNum) => submissions.find(s => s.roundNumber === rNum);

  // Compute average of completed rounds
  const completedSubs = submissions.filter(s => completedRounds.includes(s.roundNumber));
  const avgWpm = completedSubs.length > 0
    ? Math.round(completedSubs.reduce((acc, s) => acc + s.wpm, 0) / completedSubs.length)
    : 0;
  const avgAcc = completedSubs.length > 0
    ? Math.round((completedSubs.reduce((acc, s) => acc + s.accuracy, 0) / completedSubs.length) * 10) / 10
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Welcome & Profile Banner */}
      <div className="bg-gradient-to-r from-wine-card via-burgundy-950 to-wine-card border border-wine-border/80 rounded-2xl p-6 sm:p-8 shadow-burgundy mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-burgundy-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-burgundy-900/60 border border-burgundy-700/50 text-gold-300 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
              <span>BCAlgorix Official Contestant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-fest font-bold text-white tracking-wide">
              Welcome, <span className="text-gold-300">{user.name}</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
              <span className="font-mono-code text-gold-400/90 font-medium">SUC: {user.sucCode}</span>
              <span className="text-gray-600">•</span>
              <span>Progress: {completedRounds.length}/3 Rounds Completed</span>
            </p>
          </div>

          {/* Quick Stats Summary */}
          {completedRounds.length > 0 && (
            <div className="flex items-center gap-4 bg-wine-dark/70 border border-wine-border/80 rounded-xl p-3.5 sm:px-6">
              <div className="text-center">
                <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Avg Speed</span>
                <span className="text-xl font-bold font-mono-code text-gold-400">{avgWpm} WPM</span>
              </div>
              <div className="h-8 w-px bg-wine-border/80" />
              <div className="text-center">
                <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Avg Accuracy</span>
                <span className="text-xl font-bold font-mono-code text-emerald-400">{avgAcc}%</span>
              </div>
              <div className="h-8 w-px bg-wine-border/80" />
              <div className="text-center">
                <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Rounds</span>
                <span className="text-xl font-bold font-mono-code text-white">{completedRounds.length}/3</span>
              </div>
            </div>
          )}
        </div>

        {/* Rest Policy Notification Banner */}
        <div className="mt-6 pt-5 border-t border-wine-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-burgundy-200/90 bg-burgundy-950/40 -mx-6 -mb-6 p-4 sm:px-6 rounded-b-2xl">
          <div className="flex items-center space-x-2">
            <Coffee className="w-4 h-4 text-gold-400 flex-shrink-0" />
            <span>
              <strong>Pacing Policy:</strong> You do <em>not</em> need to rush all 3 rounds back-to-back. Rest between rounds as you desire. Each round's timer begins <strong>only when you click Start</strong>.
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-amber-300 font-medium flex-shrink-0">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Single Attempt Per Round</span>
          </div>
        </div>
      </div>

      {/* Completion Banner if all 3 finished */}
      {completedRounds.length === 3 && (
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-burgundy-900/50 to-amber-950/40 border border-gold-500/40 shadow-gold text-center relative overflow-hidden">
          <Trophy className="w-12 h-12 text-gold-400 mx-auto mb-3" />
          <h2 className="text-2xl font-fest font-bold text-gold-300">
            All 3 Contest Rounds Completed!
          </h2>
          <p className="text-sm text-gray-300 max-w-xl mx-auto mt-2 mb-4">
            Congratulations! Your 3-round typing data has been securely saved to the BCAlgorix records. The organizers will reveal the final Top 3 podium on the official leaderboard after all contestants conclude.
          </p>
          <button
            onClick={onViewLeaderboard}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-gold-400 text-black font-bold text-sm shadow-gold hover:scale-105 transition-transform"
          >
            Check Leaderboard Status
          </button>
        </div>
      )}

      {/* 1-Minute Warm-Up Banner */}
      <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-burgundy-950/70 via-wine-card to-burgundy-950/70 border border-burgundy-700/60 shadow-burgundy flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/40 flex items-center justify-center text-gold-400 flex-shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-fest font-bold text-white">
              Want to calibrate your fingers first?
            </h3>
            <p className="text-xs text-gray-400">
              Try the 1-Minute Practice Arena with unlimited attempts. Test visible, masked, or blind mode before your official attempt.
            </p>
          </div>
        </div>

        <button
          onClick={() => onStartPractice && onStartPractice(1)}
          className="px-5 py-2.5 rounded-xl bg-wine-card hover:bg-wine-cardHover border border-gold-500/50 text-gold-300 hover:text-white text-xs font-bold shadow-sm transition-all whitespace-nowrap flex items-center justify-center gap-2"
        >
          <Zap className="w-3.5 h-3.5 text-gold-400" />
          <span>Launch 1-Min Practice</span>
        </button>
      </div>

      {/* Rounds Arena Grid */}
      <h2 className="text-xl font-fest font-bold text-white mb-5 flex items-center space-x-2">
        <span>Contest Rounds</span>
        <span className="text-xs font-sans text-gray-400 font-normal">
          (Progress sequentially from Round 1 to 3)
        </span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rounds.map((round) => {
          const isCompleted = completedRounds.includes(round.roundNumber);
          const sub = getSub(round.roundNumber);

          // Round is available if it's Round 1 OR if previous round was completed
          const isUnlocked = round.roundNumber === 1 || completedRounds.includes(round.roundNumber - 1);
          const isNextUp = !isCompleted && isUnlocked;

          return (
            <div
              key={round.roundNumber}
              className={`rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                isCompleted
                  ? 'bg-wine-card/70 border-emerald-900/50 hover:border-emerald-800'
                  : isNextUp
                  ? 'bg-wine-card border-burgundy-500/80 shadow-burgundy ring-1 ring-burgundy-500/40 hover:scale-[1.02]'
                  : 'bg-wine-card/40 border-wine-border/40 opacity-70'
              }`}
            >
              {/* Card Header */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    isCompleted
                      ? 'bg-emerald-950/70 border-emerald-800/80 text-emerald-300'
                      : isNextUp
                      ? 'bg-burgundy-900/80 border-burgundy-600 text-gold-300'
                      : 'bg-gray-900 border-gray-800 text-gray-400'
                  }`}>
                    {round.badge}
                  </span>

                  <span className="text-xs font-mono-code text-gray-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-burgundy-400" />
                    {round.timeLimit}
                  </span>
                </div>

                <h3 className="text-lg font-fest font-bold text-white mb-2">
                  {round.title}
                </h3>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                  {round.description}
                </p>

                {/* Round Rules Checklist */}
                <div className="space-y-2 bg-wine-dark/70 rounded-xl p-3.5 border border-wine-border/60 mb-4">
                  <div className="text-[11px] uppercase tracking-wider text-burgundy-300 font-semibold mb-1">
                    Round Rules
                  </div>
                  {round.rules.map((rule, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs">
                      {rule.allowed ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full bg-red-950 border border-red-700 text-red-400 flex items-center justify-center text-[9px] font-bold mt-0.5 flex-shrink-0">
                          ✕
                        </span>
                      )}
                      <div>
                        <span className={rule.allowed ? 'text-gray-200' : 'text-red-300 font-medium'}>
                          {rule.label}
                        </span>
                        {rule.note && (
                          <span className="block text-[10px] text-gray-500">
                            {rule.note}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Completed Round Stats */}
                {isCompleted && sub && (
                  <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3.5 space-y-1.5">
                    <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Attempt Result</span>
                      <span className="text-emerald-300 font-mono-code">Locked</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <div>
                        <span className="text-[10px] text-gray-400 block">Speed</span>
                        <span className="text-sm font-bold font-mono-code text-gold-400">{sub.wpm} WPM</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block">Accuracy</span>
                        <span className="text-sm font-bold font-mono-code text-emerald-400">{sub.accuracy}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block">Time</span>
                        <span className="text-sm font-bold font-mono-code text-white">{sub.timeTakenSeconds}s</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Action Footer */}
              <div className="p-6 pt-0">
                {isCompleted ? (
                  <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs font-semibold text-center flex items-center justify-center space-x-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Round Completed & Locked</span>
                  </div>
                ) : isNextUp ? (
                  <button
                    onClick={() => onStartRound(round.roundNumber)}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-burgundy-700 via-burgundy-600 to-burgundy-700 hover:from-burgundy-600 hover:to-burgundy-500 text-white font-semibold text-sm shadow-burgundy flex items-center justify-center space-x-2 group transition-all"
                  >
                    <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                    <span>Start Round {round.roundNumber}</span>
                  </button>
                ) : (
                  <div className="w-full py-2.5 px-4 rounded-xl bg-wine-dark/70 border border-wine-border/60 text-gray-500 text-xs font-medium text-center flex items-center justify-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Locked (Complete Round {round.roundNumber - 1} First)</span>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
