import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthPage from './components/AuthPage';
import DashboardPage from './components/DashboardPage';
import TypingArenaPage from './components/TypingArenaPage';
import RoundResultModal from './components/RoundResultModal';
import LeaderboardPage from './components/LeaderboardPage';
import AdminDashboardPage from './components/AdminDashboardPage';

export default function App() {
  const [user, setUser] = useState(null);
  const [candidateToken, setCandidateToken] = useState(localStorage.getItem('bcalgorix_token') || '');
  const [admin, setAdmin] = useState(null);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('bcalgorix_admin_token') || '');

  const [currentView, setCurrentView] = useState('auth'); // 'auth' | 'dashboard' | 'arena' | 'leaderboard' | 'admin'
  const [activeRoundNumber, setActiveRoundNumber] = useState(1);
  const [roundResult, setRoundResult] = useState(null);

  // Restore candidate session on load
  useEffect(() => {
    const savedUser = localStorage.getItem('bcalgorix_user');
    const savedAdmin = localStorage.getItem('bcalgorix_admin');

    if (candidateToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setCurrentView('dashboard');
        // Refresh me from server
        fetchMe(candidateToken);
      } catch (e) {
        localStorage.removeItem('bcalgorix_user');
      }
    } else if (adminToken && savedAdmin) {
      try {
        const parsed = JSON.parse(savedAdmin);
        setAdmin(parsed);
        setCurrentView('admin');
      } catch (e) {
        localStorage.removeItem('bcalgorix_admin');
      }
    } else {
      setCurrentView('auth');
    }
  }, []);

  // Refresh candidate profile
  const fetchMe = async (token) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        localStorage.setItem('bcalgorix_user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.error('Error syncing profile:', err);
    }
  };

  const handleCandidateAuthSuccess = (token, userData) => {
    setCandidateToken(token);
    setUser(userData);
    localStorage.setItem('bcalgorix_token', token);
    localStorage.setItem('bcalgorix_user', JSON.stringify(userData));
    setCurrentView('dashboard');
  };

  const handleAdminAuthSuccess = (token, adminData) => {
    setAdminToken(token);
    setAdmin(adminData);
    localStorage.setItem('bcalgorix_admin_token', token);
    localStorage.setItem('bcalgorix_admin', JSON.stringify(adminData));
    setCurrentView('admin');
  };

  const handleLogout = () => {
    setUser(null);
    setAdmin(null);
    setCandidateToken('');
    setAdminToken('');
    localStorage.removeItem('bcalgorix_token');
    localStorage.removeItem('bcalgorix_user');
    localStorage.removeItem('bcalgorix_admin_token');
    localStorage.removeItem('bcalgorix_admin');
    setCurrentView('auth');
  };

  const handleStartRound = (rNum) => {
    setActiveRoundNumber(rNum);
    setCurrentView('arena');
  };

  const handleFinishRound = (result) => {
    setRoundResult(result);
    if (candidateToken) {
      fetchMe(candidateToken);
    }
  };

  const handleContinueToDashboard = () => {
    setRoundResult(null);
    setCurrentView('dashboard');
  };

  const handleNextRound = () => {
    const nextR = (roundResult?.roundNumber || activeRoundNumber) + 1;
    setRoundResult(null);
    setActiveRoundNumber(nextR);
    setCurrentView('arena');
  };

  return (
    <div className="min-h-screen bg-[#0E0103] text-gray-100 flex flex-col selection:bg-burgundy-700 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        user={user}
        admin={admin}
        currentView={currentView}
        setView={setCurrentView}
        onLogout={handleLogout}
      />

      {/* Main Viewport */}
      <main className="flex-1">
        {currentView === 'auth' && (
          <AuthPage
            onCandidateAuthSuccess={handleCandidateAuthSuccess}
            onAdminAuthSuccess={handleAdminAuthSuccess}
          />
        )}

        {currentView === 'dashboard' && user && (
          <DashboardPage
            user={user}
            onStartRound={handleStartRound}
            onViewLeaderboard={() => setCurrentView('leaderboard')}
          />
        )}

        {currentView === 'arena' && user && (
          <TypingArenaPage
            roundNumber={activeRoundNumber}
            token={candidateToken}
            onFinishRound={handleFinishRound}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'leaderboard' && (
          <LeaderboardPage
            token={admin ? adminToken : candidateToken}
            admin={!!admin}
            onGoToAdmin={() => setCurrentView('admin')}
          />
        )}

        {currentView === 'admin' && admin && (
          <AdminDashboardPage
            token={adminToken}
            onPreviewLeaderboard={() => setCurrentView('leaderboard')}
          />
        )}
      </main>

      {/* Post-Round Result Modal */}
      {roundResult && (
        <RoundResultModal
          result={roundResult}
          onContinueToDashboard={handleContinueToDashboard}
          onNextRound={handleNextRound}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-wine-border/40 py-6 text-center text-xs text-gray-500 bg-wine-dark/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            © 2026 <strong className="text-gray-400">BCAlgorix</strong> Blind Typing Championship. All rights reserved.
          </p>
          <p className="text-[11px] text-gray-600">
            Engineered with React, Node.js & MongoDB • Burgundy Royale Theme
          </p>
        </div>
      </footer>

    </div>
  );
}
