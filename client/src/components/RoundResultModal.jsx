import React from 'react';
import { Trophy, CheckCircle2, ArrowRight, Coffee, Zap, Target, Clock } from 'lucide-react';

export default function RoundResultModal({ result, onContinueToDashboard, onNextRound }) {
  if (!result) return null;

  const { roundNumber, wpm, accuracy, timeTakenSeconds, score } = result;
  const isFinalRound = roundNumber === 3;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-wine-card to-wine-dark border border-burgundy-600/70 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center shadow-burgundy-lg relative overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-burgundy-600/20 rounded-full blur-2xl pointer-events-none" />

        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-burgundy-800 to-burgundy-600 border border-burgundy-500/60 shadow-burgundy mb-4">
          <Trophy className="w-8 h-8 text-gold-400" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-fest font-bold text-white mb-1">
          Round {roundNumber} Completed!
        </h2>
        <p className="text-xs uppercase tracking-widest text-burgundy-300 font-semibold mb-6">
          BCAlgorix Official Evaluation
        </p>

        {/* Results Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          
          <div className="bg-wine-dark/80 border border-wine-border/80 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center space-x-1 text-gold-400 text-xs mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider font-semibold">Speed</span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono-code font-bold text-white">
              {wpm}
            </div>
            <span className="text-[11px] text-gray-400">Words Per Minute</span>
          </div>

          <div className="bg-wine-dark/80 border border-wine-border/80 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center space-x-1 text-emerald-400 text-xs mb-1">
              <Target className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider font-semibold">Accuracy</span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono-code font-bold text-emerald-400">
              {accuracy}%
            </div>
            <span className="text-[11px] text-gray-400">Precision Rate</span>
          </div>

          <div className="bg-wine-dark/80 border border-wine-border/80 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center space-x-1 text-sky-400 text-xs mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider font-semibold">Time Taken</span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono-code font-bold text-white">
              {timeTakenSeconds}s
            </div>
            <span className="text-[11px] text-gray-400">Duration</span>
          </div>

          <div className="bg-wine-dark/80 border border-wine-border/80 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center space-x-1 text-amber-400 text-xs mb-1">
              <Trophy className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider font-semibold">Round Score</span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono-code font-bold text-gold-400">
              {score}
            </div>
            <span className="text-[11px] text-gray-400">Composite Rating</span>
          </div>

        </div>

        {/* Rest reminder message */}
        <div className="p-3.5 bg-burgundy-950/60 rounded-xl border border-burgundy-800/60 text-xs text-burgundy-200 mb-6 flex items-center justify-center space-x-2">
          <Coffee className="w-4 h-4 text-gold-400 flex-shrink-0" />
          <span>
            {isFinalRound
              ? "All 3 rounds finished! Your overall standing will be averaged for the final podium."
              : "Remember: You can take a rest now! Round " + (roundNumber + 1) + " timer starts only when you are ready."}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onContinueToDashboard}
            className="flex-1 py-3 px-4 rounded-xl bg-wine-card hover:bg-wine-cardHover border border-wine-border text-gray-200 text-sm font-semibold flex items-center justify-center space-x-2 transition-all"
          >
            <Coffee className="w-4 h-4 text-gold-400" />
            <span>Rest & Go to Dashboard</span>
          </button>

          {!isFinalRound && (
            <button
              onClick={onNextRound}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-burgundy-700 to-burgundy-600 hover:from-burgundy-600 hover:to-burgundy-500 text-white text-sm font-bold shadow-burgundy flex items-center justify-center space-x-2 transition-all"
            >
              <span>Round {roundNumber + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
