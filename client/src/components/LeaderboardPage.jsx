import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Lock, 
  Sparkles, 
  RefreshCw, 
  Zap, 
  Target, 
  Clock, 
  ShieldCheck,
  Award
} from 'lucide-react';

export default function LeaderboardPage({ token, admin, onGoToAdmin }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/leaderboard', { headers });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to load leaderboard');
      }

      setData(json);

      // Trigger celebration confetti if revealed and has contestants
      if (json.revealed && json.top3 && json.top3.length > 0) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-burgundy-700 border-t-gold-400 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm font-medium">Loading BCAlgorix Standings...</p>
      </div>
    );
  }

  // SEALED / LOCKED STATE
  if (!data?.revealed) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        
        <div className="bg-gradient-to-b from-wine-card to-wine-dark border-2 border-wine-border rounded-3xl p-8 sm:p-12 shadow-burgundy-lg relative overflow-hidden">
          
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-burgundy-950/90 border-2 border-burgundy-600/60 flex items-center justify-center shadow-burgundy">
            <Lock className="w-10 h-10 text-gold-400 animate-pulse" />
          </div>

          <span className="px-3.5 py-1 rounded-full bg-burgundy-900/60 border border-burgundy-700/60 text-gold-300 text-xs font-semibold uppercase tracking-widest inline-block mb-3">
            Official Fest Notice
          </span>

          <h1 className="text-2xl sm:text-4xl font-fest font-bold text-white mb-4">
            Leaderboard Currently Sealed
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto mb-8 leading-relaxed">
            {data?.message || 'The BCAlgorix official leaderboard is currently sealed. Organizers will reveal the final standings once all candidate rounds conclude.'}
          </p>

          {/* Scoring Methodology Card */}
          <div className="bg-wine-dark/80 border border-wine-border/80 rounded-2xl p-5 max-w-lg mx-auto text-left mb-8">
            <h3 className="text-xs uppercase tracking-wider text-burgundy-300 font-bold mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-gold-400" />
              <span>Final Standings Evaluation Method</span>
            </h3>
            <ul className="text-xs text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-gold-400 font-bold">•</span>
                <span><strong>Speed (WPM):</strong> Average Net Words Per Minute across all 3 rounds.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Accuracy:</strong> Character-by-character accuracy (%) across rounds.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-400 font-bold">•</span>
                <span><strong>Execution Time:</strong> Total duration taken to complete the prompts.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>Top 3 Podium:</strong> Crowned by 3-round composite weighted score.</span>
              </li>
            </ul>
          </div>

          {/* Action button */}
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={fetchLeaderboard}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-wine-card hover:bg-wine-cardHover border border-wine-border text-sm font-semibold text-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Check if Revealed</span>
            </button>

            {admin && (
              <button
                onClick={onGoToAdmin}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 text-black text-sm font-bold shadow-gold hover:scale-105 transition-all"
              >
                <span>Go to Admin Panel to Reveal</span>
              </button>
            )}
          </div>

        </div>

      </div>
    );
  }

  // REVEALED LEADERBOARD STATE
  const top3 = data?.top3 || [];
  const fullLeaderboard = data?.leaderboard || [];

  // Arrange podium order: [2nd (Silver), 1st (Gold), 3rd (Bronze)]
  const firstPlace = top3.find(c => c.rank === 1);
  const secondPlace = top3.find(c => c.rank === 2);
  const thirdPlace = top3.find(c => c.rank === 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-gold-500/20 border border-gold-500/50 text-gold-300 text-xs font-bold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          <span>Official Winners Announced</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-fest font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-amber-200 mb-2">
          BCAlgorix Champions
        </h1>
        <p className="text-sm text-gray-400 max-w-xl mx-auto">
          Final standings determined by 3-round performance average (Speed, Accuracy, and Time).
        </p>
      </div>

      {/* TOP 3 ELEVATED PODIUM */}
      {top3.length > 0 ? (
        <div className="mb-14">
          <div className="flex flex-col md:flex-row items-end justify-center gap-4 max-w-4xl mx-auto pt-8">
            
            {/* 2ND PLACE (SILVER) - Left */}
            {secondPlace && (
              <div className="w-full md:w-1/3 order-2 md:order-1 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-gray-700 to-gray-500 border-2 border-gray-300 flex items-center justify-center shadow-lg mb-3">
                  <Medal className="w-8 h-8 text-gray-200" />
                </div>
                <div className="w-full bg-gradient-to-b from-wine-card to-wine-dark border-2 border-gray-400/60 rounded-2xl p-5 text-center shadow-md relative">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gray-400 text-black text-xs font-bold">
                    2nd Place • Silver
                  </span>
                  <h3 className="font-fest font-bold text-lg text-white mt-1 truncate">
                    {secondPlace.name}
                  </h3>
                  <p className="text-[11px] font-mono-code text-gray-400 mb-3">
                    SUC: {secondPlace.sucCode}
                  </p>
                  <div className="space-y-1.5 text-xs border-t border-wine-border pt-3">
                    <div className="flex justify-between text-gray-300">
                      <span>Avg Speed:</span>
                      <strong className="font-mono-code text-gold-400">{secondPlace.avgWpm} WPM</strong>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Avg Accuracy:</span>
                      <strong className="font-mono-code text-emerald-400">{secondPlace.avgAccuracy}%</strong>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Final Score:</span>
                      <strong className="font-mono-code text-white">{secondPlace.finalScore}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 1ST PLACE (GOLD) - Center & Elevated */}
            {firstPlace && (
              <div className="w-full md:w-1/3 order-1 md:order-2 flex flex-col items-center -mt-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-600 via-gold-400 to-yellow-300 border-4 border-gold-200 flex items-center justify-center shadow-gold mb-3 animate-bounce">
                  <Crown className="w-10 h-10 text-black fill-current" />
                </div>
                <div className="w-full bg-gradient-to-b from-burgundy-950 via-wine-card to-wine-dark border-2 border-gold-400 rounded-3xl p-6 text-center shadow-burgundy-lg relative">
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-gradient-to-r from-gold-500 to-amber-400 text-black text-xs font-black uppercase tracking-wider shadow-gold">
                    Champion • 1st Place
                  </span>
                  <h3 className="font-fest font-extrabold text-xl text-gold-300 mt-2 truncate">
                    {firstPlace.name}
                  </h3>
                  <p className="text-xs font-mono-code text-gold-400/80 mb-4">
                    SUC: {firstPlace.sucCode}
                  </p>
                  <div className="space-y-2 text-xs border-t border-wine-border/80 pt-3">
                    <div className="flex justify-between text-gray-200">
                      <span>Avg Speed:</span>
                      <strong className="font-mono-code text-gold-300 text-sm">{firstPlace.avgWpm} WPM</strong>
                    </div>
                    <div className="flex justify-between text-gray-200">
                      <span>Avg Accuracy:</span>
                      <strong className="font-mono-code text-emerald-400 text-sm">{firstPlace.avgAccuracy}%</strong>
                    </div>
                    <div className="flex justify-between text-gray-200">
                      <span>Final Score:</span>
                      <strong className="font-mono-code text-gold-400 text-base">{firstPlace.finalScore}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3RD PLACE (BRONZE) - Right */}
            {thirdPlace && (
              <div className="w-full md:w-1/3 order-3 md:order-3 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-800 to-amber-700 border-2 border-amber-600 flex items-center justify-center shadow-lg mb-3">
                  <Award className="w-8 h-8 text-amber-200" />
                </div>
                <div className="w-full bg-gradient-to-b from-wine-card to-wine-dark border-2 border-amber-700/60 rounded-2xl p-5 text-center shadow-md relative">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-700 text-white text-xs font-bold">
                    3rd Place • Bronze
                  </span>
                  <h3 className="font-fest font-bold text-lg text-white mt-1 truncate">
                    {thirdPlace.name}
                  </h3>
                  <p className="text-[11px] font-mono-code text-gray-400 mb-3">
                    SUC: {thirdPlace.sucCode}
                  </p>
                  <div className="space-y-1.5 text-xs border-t border-wine-border pt-3">
                    <div className="flex justify-between text-gray-300">
                      <span>Avg Speed:</span>
                      <strong className="font-mono-code text-gold-400">{thirdPlace.avgWpm} WPM</strong>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Avg Accuracy:</span>
                      <strong className="font-mono-code text-emerald-400">{thirdPlace.avgAccuracy}%</strong>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Final Score:</span>
                      <strong className="font-mono-code text-white">{thirdPlace.finalScore}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-wine-card/40 rounded-2xl border border-wine-border/60 max-w-xl mx-auto mb-8">
          <p className="text-gray-400 text-sm">No contestants have completed rounds yet.</p>
        </div>
      )}

      {/* FULL LEADERBOARD TABLE */}
      <div className="bg-wine-card border border-wine-border/80 rounded-2xl overflow-hidden shadow-burgundy">
        <div className="p-5 border-b border-wine-border/60 flex items-center justify-between">
          <h2 className="text-lg font-fest font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gold-400" />
            <span>Complete Contestant Rankings</span>
          </h2>
          <button
            onClick={fetchLeaderboard}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-wine-dark border border-wine-border text-xs text-gray-300 hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-wine-border/80 bg-wine-dark/70 text-[11px] uppercase tracking-wider text-gray-400">
                <th className="py-3.5 px-4 text-center">Rank</th>
                <th className="py-3.5 px-4">Candidate</th>
                <th className="py-3.5 px-4">10-Digit SUC</th>
                <th className="py-3.5 px-4 text-center">Rounds</th>
                <th className="py-3.5 px-4 text-right">Avg Speed</th>
                <th className="py-3.5 px-4 text-right">Avg Accuracy</th>
                <th className="py-3.5 px-4 text-right">Total Time</th>
                <th className="py-3.5 px-4 text-right">Final Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wine-border/40 text-xs sm:text-sm">
              {fullLeaderboard.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No participants registered yet.
                  </td>
                </tr>
              ) : (
                fullLeaderboard.map((cand) => {
                  const isTop3 = cand.rank <= 3;
                  return (
                    <tr 
                      key={cand.sucCode}
                      className={`hover:bg-wine-cardHover transition-colors ${
                        cand.rank === 1 ? 'bg-gold-500/10 font-medium' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        {cand.rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gold-400 text-black font-extrabold text-xs">
                            1
                          </span>
                        ) : cand.rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-300 text-black font-bold text-xs">
                            2
                          </span>
                        ) : cand.rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white font-bold text-xs">
                            3
                          </span>
                        ) : (
                          <span className="text-gray-400 font-mono-code">{cand.rank}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-white">
                        {cand.name}
                        {isTop3 && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-burgundy-900 border border-burgundy-700 text-gold-300 uppercase tracking-widest font-bold">
                            Podium
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono-code text-gray-400">
                        {cand.sucCode}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          cand.roundsAttempted === 3
                            ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                            : 'bg-wine-dark border border-wine-border text-gray-400'
                        }`}>
                          {cand.roundsAttempted}/3
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono-code text-gold-400 font-bold">
                        {cand.avgWpm} WPM
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono-code text-emerald-400 font-bold">
                        {cand.avgAccuracy}%
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono-code text-gray-300">
                        {cand.totalTime}s
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono-code text-base font-extrabold text-white">
                        {cand.finalScore}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
