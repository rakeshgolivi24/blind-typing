import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Trophy, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Target, 
  Crown, 
  Sparkles,
  ExternalLink,
  X,
  Save,
  Database,
  Edit3
} from 'lucide-react';

export default function AdminDashboardPage({ token, onPreviewLeaderboard }) {
  const [stats, setStats] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Active Tab: 'roster' | 'prompts'
  const [activeTab, setActiveTab] = useState('roster');
  const [prompts, setPrompts] = useState([]);
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Inspection modal state
  const [inspectModal, setInspectModal] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  // Fetch admin stats & candidates
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [statsRes, candRes] = await Promise.all([
        fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/admin/candidates', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const statsData = await statsRes.json();
      const candData = await candRes.json();

      if (!statsRes.ok) throw new Error(statsData.error || 'Failed to fetch contest stats');
      if (!candRes.ok) throw new Error(candData.error || 'Failed to fetch candidate roster');

      setStats(statsData);
      setCandidates(candData.candidates || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch contest prompts from MongoDB Atlas
  const fetchPrompts = async () => {
    try {
      setPromptsLoading(true);
      const res = await fetch('/api/admin/prompts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.prompts) {
        setPrompts(data.prompts);
      }
    } catch (err) {
      console.error('Error loading prompts:', err);
    } finally {
      setPromptsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchPrompts();
  }, [token]);

  const handlePromptChange = (index, field, value) => {
    setPrompts(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSavePrompts = async () => {
    try {
      setSaveLoading(true);
      setMessage('');
      setError('');

      const res = await fetch('/api/admin/prompts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ prompts })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save contest paragraphs');

      setMessage('Contest paragraphs for Round 1, 2, and 3 saved successfully to MongoDB Atlas!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  // Toggle Leaderboard Reveal
  const handleToggleLeaderboard = async () => {
    try {
      setToggleLoading(true);
      setMessage('');
      setError('');

      const res = await fetch('/api/admin/toggle-leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ revealed: !stats.leaderboardRevealed })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Toggle failed');

      setMessage(data.message);
      setStats(prev => ({ ...prev, leaderboardRevealed: data.leaderboardRevealed }));
    } catch (err) {
      setError(err.message);
    } finally {
      setToggleLoading(false);
    }
  };

  // Inspect Candidate Keystrokes
  const handleInspect = async (sucCode, roundNumber) => {
    try {
      setInspectLoading(true);
      const res = await fetch(`/api/admin/inspect/${sucCode}/${roundNumber}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load attempt details');

      setInspectModal(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setInspectLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-burgundy-700 border-t-gold-400 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm font-medium">Loading Organizer Admin Console...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-wine-border/70">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/40 text-gold-300 text-xs font-bold uppercase tracking-widest mb-2">
            <Crown className="w-3.5 h-3.5 text-gold-400" />
            <span>BCAlgorix Official Organizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-fest font-bold text-white">
            Contest Control Center
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Monitor real-time candidates, verify blind typing submissions, and trigger the Winner Reveal Board.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-wine-card hover:bg-wine-cardHover border border-wine-border text-xs sm:text-sm font-semibold text-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Roster</span>
          </button>

          <button
            onClick={onPreviewLeaderboard}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-wine-card hover:bg-wine-cardHover border border-wine-border text-xs sm:text-sm font-semibold text-gold-300 transition-colors"
          >
            <Trophy className="w-4 h-4 text-gold-400" />
            <span>View Leaderboard</span>
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {message && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-sm flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-700 text-red-200 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-white">✕</button>
        </div>
      )}

      {/* STATS TILES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        
        <div className="bg-wine-card border border-wine-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span className="uppercase tracking-wider">Total Candidates</span>
            <Users className="w-4 h-4 text-gold-400" />
          </div>
          <div className="text-3xl font-fest font-bold text-white">
            {stats?.totalCandidates || 0}
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">Registered via 10-digit SUC</span>
        </div>

        <div className="bg-wine-card border border-wine-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span className="uppercase tracking-wider">Round Submissions</span>
            <Zap className="w-4 h-4 text-burgundy-400" />
          </div>
          <div className="text-3xl font-fest font-bold text-white">
            {stats?.totalSubmissions || 0}
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">
            R1: {stats?.submissionsByRound?.round1 || 0} | R2: {stats?.submissionsByRound?.round2 || 0} | R3: {stats?.submissionsByRound?.round3 || 0}
          </span>
        </div>

        <div className="bg-wine-card border border-wine-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span className="uppercase tracking-wider">All 3 Rounds Done</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-fest font-bold text-emerald-400">
            {stats?.fullyCompletedCandidates || 0}
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">Ready for final podium</span>
        </div>

        <div className="bg-wine-card border border-wine-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span className="uppercase tracking-wider">Leaderboard Status</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className={`text-xl font-bold mt-1 ${stats?.leaderboardRevealed ? 'text-emerald-400' : 'text-amber-400'}`}>
            {stats?.leaderboardRevealed ? 'PUBLICLY REVEALED' : 'SEALED & HIDDEN'}
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">Candidates see this status</span>
        </div>

      </div>

      {/* LEADERBOARD REVEAL CONTROL PANEL */}
      <div className={`rounded-2xl border p-6 mb-10 transition-all ${
        stats?.leaderboardRevealed 
          ? 'bg-gradient-to-r from-emerald-950/40 via-wine-card to-emerald-950/40 border-emerald-700/60 shadow-lg' 
          : 'bg-gradient-to-r from-burgundy-950/50 via-wine-card to-burgundy-950/50 border-burgundy-600/70 shadow-burgundy'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${stats?.leaderboardRevealed ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <h2 className="text-xl font-fest font-bold text-white">
                Winner Reveal Board Controller
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
              {stats?.leaderboardRevealed
                ? "The leaderboard is currently LIVE. Candidates can see the elevated Top 3 podium, rankings, and average performance scores."
                : "The leaderboard is currently SEALED. Candidates see a locked shield. When you click Reveal, the Top 3 champions will be unveiled with celebratory confetti."}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleToggleLeaderboard}
              disabled={toggleLoading}
              className={`px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center space-x-2 ${
                stats?.leaderboardRevealed
                  ? 'bg-red-800 hover:bg-red-700 text-white'
                  : 'bg-gradient-to-r from-gold-500 via-amber-400 to-gold-500 hover:from-gold-400 hover:to-amber-300 text-black shadow-gold scale-105'
              }`}
            >
              {stats?.leaderboardRevealed ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>Seal Leaderboard (Hide from Candidates)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Reveal Leaderboard & Top 3 Winners</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'roster'
              ? 'bg-gradient-to-r from-burgundy-700 to-burgundy-600 text-white shadow-burgundy'
              : 'bg-wine-card text-gray-400 hover:text-gray-200 border border-wine-border'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Candidate Roster & Keystrokes</span>
          <span className="px-2 py-0.5 rounded-full bg-burgundy-950 text-gold-300 text-xs font-mono-code font-bold">
            {candidates.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('prompts')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'prompts'
              ? 'bg-gradient-to-r from-burgundy-700 to-burgundy-600 text-white shadow-burgundy'
              : 'bg-wine-card text-gray-400 hover:text-gray-200 border border-wine-border'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Contest Paragraphs (MongoDB Cloud)</span>
          <span className="px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-300 text-xs font-mono-code font-bold">
            3 Rounds
          </span>
        </button>
      </div>

      {/* CANDIDATES LIVE MONITOR */}
      {activeTab === 'roster' && (
        <div className="bg-wine-card border border-wine-border/80 rounded-2xl overflow-hidden shadow-burgundy">
          <div className="p-5 border-b border-wine-border/60 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-fest font-bold text-white">
                Candidate Progress & Keystroke Audit
              </h2>
              <p className="text-xs text-gray-400">
                Live records of registered contestants, completed rounds, and scores.
              </p>
            </div>
            <span className="text-xs text-gold-400 font-mono-code font-semibold">
              {candidates.length} Candidate{candidates.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-wine-border/80 bg-wine-dark/70 text-[11px] uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 px-4">Candidate Name</th>
                  <th className="py-3.5 px-4">10-Digit SUC</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Round 1</th>
                  <th className="py-3.5 px-4 text-center">Round 2</th>
                  <th className="py-3.5 px-4 text-center">Round 3</th>
                  <th className="py-3.5 px-4 text-right">3-Round Avg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wine-border/40 text-xs sm:text-sm">
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      No candidates have registered yet. Test by registering a candidate on the login page!
                    </td>
                  </tr>
                ) : (
                  candidates.map((cand) => (
                    <tr key={cand.id || cand.sucCode} className="hover:bg-wine-cardHover transition-colors">
                      
                      <td className="py-3.5 px-4 font-medium text-white">
                        {cand.name}
                        <span className="block text-[10px] text-gray-500">
                          Joined: {new Date(cand.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono-code text-gold-400/90 font-medium">
                        {cand.sucCode}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          cand.hasCompletedAll
                            ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                            : cand.roundsCompleted.length > 0
                            ? 'bg-burgundy-950 border border-burgundy-800 text-gold-300'
                            : 'bg-wine-dark border border-wine-border text-gray-400'
                        }`}>
                          {cand.hasCompletedAll ? 'Finished 3/3' : `${cand.roundsCompleted.length}/3 Done`}
                        </span>
                      </td>

                      {/* ROUND 1 STATS */}
                      <td className="py-3.5 px-4 text-center">
                        {cand.round1 ? (
                          <div className="inline-block bg-wine-dark/90 border border-wine-border/70 rounded-lg p-1.5 text-[11px] font-mono-code text-center">
                            <span className="text-gold-400 font-bold">{cand.round1.wpm}WPM</span>
                            <span className="text-gray-500 mx-1">|</span>
                            <span className="text-emerald-400">{cand.round1.accuracy}%</span>
                            <button
                              onClick={() => handleInspect(cand.sucCode, 1)}
                              title="Inspect Typed Text"
                              className="block text-[10px] text-burgundy-300 hover:text-white hover:underline mt-0.5 mx-auto"
                            >
                              Inspect
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-600 text-xs">Pending</span>
                        )}
                      </td>

                      {/* ROUND 2 STATS */}
                      <td className="py-3.5 px-4 text-center">
                        {cand.round2 ? (
                          <div className="inline-block bg-wine-dark/90 border border-wine-border/70 rounded-lg p-1.5 text-[11px] font-mono-code text-center">
                            <span className="text-gold-400 font-bold">{cand.round2.wpm}WPM</span>
                            <span className="text-gray-500 mx-1">|</span>
                            <span className="text-emerald-400">{cand.round2.accuracy}%</span>
                            <button
                              onClick={() => handleInspect(cand.sucCode, 2)}
                              title="Inspect Typed Text"
                              className="block text-[10px] text-burgundy-300 hover:text-white hover:underline mt-0.5 mx-auto"
                            >
                              Inspect
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-600 text-xs">Pending</span>
                        )}
                      </td>

                      {/* ROUND 3 STATS */}
                      <td className="py-3.5 px-4 text-center">
                        {cand.round3 ? (
                          <div className="inline-block bg-wine-dark/90 border border-wine-border/70 rounded-lg p-1.5 text-[11px] font-mono-code text-center">
                            <span className="text-gold-400 font-bold">{cand.round3.wpm}WPM</span>
                            <span className="text-gray-500 mx-1">|</span>
                            <span className="text-emerald-400">{cand.round3.accuracy}%</span>
                            <button
                              onClick={() => handleInspect(cand.sucCode, 3)}
                              title="Inspect Typed Text"
                              className="block text-[10px] text-burgundy-300 hover:text-white hover:underline mt-0.5 mx-auto"
                            >
                              Inspect
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-600 text-xs">Pending</span>
                        )}
                      </td>

                      {/* 3-ROUND AVERAGE SCORE */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono-code font-extrabold text-base text-white">
                          {cand.avgScore}
                        </span>
                        <span className="block text-[10px] text-gray-400">
                          {cand.avgWpm} WPM • {cand.avgAccuracy}% Acc
                        </span>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PROMPTS EDITOR */}
      {activeTab === 'prompts' && (
        <div className="space-y-6">
          <div className="bg-wine-card border border-wine-border/80 rounded-2xl p-6 shadow-burgundy flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-gold-400" />
                <h2 className="text-xl font-fest font-bold text-white">
                  Contest Paragraphs (Stored in MongoDB Cloud)
                </h2>
              </div>
              <p className="text-xs text-gray-400 mt-1 max-w-2xl">
                Edit the official paragraph text, time limits, and instructions for Round 1, 2, and 3. Any changes saved here update MongoDB Atlas immediately and will be received by contestants when they start their rounds.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchPrompts}
                disabled={promptsLoading}
                className="px-4 py-2 rounded-xl bg-wine-dark hover:bg-wine-card border border-wine-border text-xs text-gray-300 font-semibold flex items-center gap-2 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${promptsLoading ? 'animate-spin' : ''}`} />
                <span>Reload from DB</span>
              </button>

              <button
                onClick={handleSavePrompts}
                disabled={saveLoading || promptsLoading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-black text-sm font-bold shadow-gold flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saveLoading ? 'Saving to Cloud...' : 'Save All Paragraphs'}</span>
              </button>
            </div>
          </div>

          {/* Prompts list */}
          {promptsLoading ? (
            <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Loading paragraphs from MongoDB Cloud...</p>
            </div>
          ) : prompts.length === 0 ? (
            <div className="p-8 text-center bg-wine-card rounded-2xl border border-wine-border text-gray-400 text-sm">
              No prompts found. Click "Reload from DB" to load default prompts.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {prompts.map((p, idx) => {
                const charCount = (p.text || '').length;
                const wordCount = (p.text || '').trim().split(/\s+/).filter(Boolean).length;

                return (
                  <div key={p.round || idx} className="bg-wine-card border border-wine-border/90 rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-wine-border/60">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 rounded-lg bg-burgundy-900 border border-burgundy-700 text-gold-300 text-xs font-bold uppercase tracking-wider">
                          Round {p.round}
                        </span>
                        <h3 className="font-fest font-bold text-lg text-white">
                          {p.title || `Round ${p.round}`}
                        </h3>
                      </div>

                      <div className="flex items-center space-x-3 text-xs font-mono-code text-gray-400">
                        <span>{charCount} Characters</span>
                        <span>•</span>
                        <span>{wordCount} Words</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-xs text-gray-400 uppercase font-semibold block mb-1">
                          Round Title
                        </label>
                        <input
                          type="text"
                          value={p.title || ''}
                          onChange={(e) => handlePromptChange(idx, 'title', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-wine-dark border border-wine-border text-white text-sm focus:border-gold-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-400 uppercase font-semibold block mb-1">
                          Time Limit (Seconds)
                        </label>
                        <input
                          type="number"
                          value={p.timeLimit || 120}
                          onChange={(e) => handlePromptChange(idx, 'timeLimit', parseInt(e.target.value, 10) || 60)}
                          className="w-full px-3.5 py-2 rounded-xl bg-wine-dark border border-wine-border text-white text-sm font-mono-code focus:border-gold-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="text-xs text-gray-400 uppercase font-semibold block mb-1">
                        Round Description / Instruction
                      </label>
                      <input
                        type="text"
                        value={p.description || ''}
                        onChange={(e) => handlePromptChange(idx, 'description', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-wine-dark border border-wine-border text-white text-sm focus:border-gold-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-gold-400 uppercase font-bold tracking-wider">
                          Contest Typing Paragraph
                        </label>
                        <span className="text-[11px] text-gray-500 font-mono-code">
                          Candidates type this exact text in Round {p.round}
                        </span>
                      </div>
                      <textarea
                        rows={5}
                        value={p.text || ''}
                        onChange={(e) => handlePromptChange(idx, 'text', e.target.value)}
                        className="w-full p-3.5 rounded-xl bg-[#120205] border border-wine-border text-gray-200 font-mono-code text-xs sm:text-sm leading-relaxed focus:border-gold-500 focus:outline-none select-text"
                        placeholder="Enter the contest paragraph text..."
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-right pt-2 pb-8">
            <button
              onClick={handleSavePrompts}
              disabled={saveLoading || promptsLoading}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-gold-500 via-amber-400 to-gold-500 hover:from-gold-400 hover:to-amber-300 text-black text-sm font-bold shadow-gold flex items-center gap-2 ml-auto transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saveLoading ? 'Saving to MongoDB Cloud...' : 'Save All Changes to MongoDB Atlas'}</span>
            </button>
          </div>
        </div>
      )}

      {/* INSPECTION AUDIT MODAL */}
      {inspectModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-wine-card border border-wine-border rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-burgundy-lg relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-wine-border/80 mb-5">
              <div>
                <h3 className="font-fest text-xl font-bold text-white">
                  Keystroke Audit: Round {inspectModal.roundNumber}
                </h3>
                <p className="text-xs text-gray-400">
                  Candidate: <strong className="text-white">{inspectModal.name}</strong> (SUC: {inspectModal.sucCode})
                </p>
              </div>
              <button
                onClick={() => setInspectModal(null)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-wine-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Performance metrics banner */}
            <div className="grid grid-cols-4 gap-2 bg-wine-dark/90 rounded-xl p-3 border border-wine-border/60 text-center mb-6">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase">Speed</span>
                <span className="text-sm font-bold font-mono-code text-gold-400">{inspectModal.wpm} WPM</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase">Accuracy</span>
                <span className="text-sm font-bold font-mono-code text-emerald-400">{inspectModal.accuracy}%</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase">Duration</span>
                <span className="text-sm font-bold font-mono-code text-white">{inspectModal.timeTakenSeconds}s</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase">Score</span>
                <span className="text-sm font-bold font-mono-code text-amber-400">{inspectModal.score}</span>
              </div>
            </div>

            {/* Prompt vs Typed Comparison */}
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase font-bold tracking-wider text-burgundy-300 block mb-1">
                  Original Official Prompt Text
                </label>
                <div className="p-3.5 rounded-xl bg-wine-dark border border-wine-border font-mono-code text-xs text-gray-300 leading-relaxed select-text">
                  {inspectModal.originalText}
                </div>
              </div>

              <div>
                <label className="text-xs uppercase font-bold tracking-wider text-gold-400 block mb-1">
                  Candidate's Exact Typed Characters
                </label>
                <div className="p-3.5 rounded-xl bg-wine-dark border border-gold-500/30 font-mono-code text-xs text-white leading-relaxed select-text">
                  {inspectModal.typedText || <span className="text-gray-500 italic">No characters typed.</span>}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-wine-border/60 text-right">
              <button
                onClick={() => setInspectModal(null)}
                className="px-5 py-2 rounded-xl bg-burgundy-900 hover:bg-burgundy-800 text-white text-xs font-semibold"
              >
                Close Audit View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
