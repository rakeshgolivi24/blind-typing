import React, { useState } from 'react';
import { Keyboard, ShieldCheck, UserCheck, KeyRound, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AuthPage({ onCandidateAuthSuccess, onAdminAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('register'); // 'login' | 'register' | 'admin'

  // Candidate register/login form state
  const [sucCode, setSucCode] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Admin form state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Status & error handling
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Candidate Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanSuc = sucCode.trim();
    if (!/^\d{10}$/.test(cleanSuc)) {
      setErrorMsg('SUC Code must be exactly 10 digits (e.g. 2452890430).');
      return;
    }

    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg('Please enter your full name (at least 2 characters).');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('Password must be at least 4 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sucCode: cleanSuc, name: name.trim(), password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccessMsg('Registration successful! Launching your contest portal...');
      setTimeout(() => {
        onCandidateAuthSuccess(data.token, data.user);
      }, 500);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Candidate Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanSuc = sucCode.trim();
    if (!/^\d{10}$/.test(cleanSuc)) {
      setErrorMsg('SUC Code must be exactly 10 digits.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sucCode: cleanSuc, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setSuccessMsg('Authenticated! Entering arena...');
      setTimeout(() => {
        onCandidateAuthSuccess(data.token, data.user);
      }, 400);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Admin Login (Fixed Credentials)
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!adminUsername || !adminPassword) {
      setErrorMsg('Enter organizer username and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername.trim(), password: adminPassword })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Admin authentication failed');
      }

      setSuccessMsg('Organizer credentials verified. Accessing admin portal...');
      setTimeout(() => {
        onAdminAuthSuccess(data.token, data.admin);
      }, 400);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-burgundy-700/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-burgundy-900/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-wine-card/90 border border-wine-border/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-burgundy relative z-10">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-burgundy-800 to-burgundy-600 border border-burgundy-500/50 shadow-burgundy mb-3">
            <Keyboard className="w-7 h-7 text-gold-400" />
          </div>
          <h1 className="font-fest text-2xl sm:text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-amber-200">
            BCAlgorix
          </h1>
          <p className="text-xs uppercase tracking-widest text-burgundy-300 font-semibold mt-1">
            Blind Typing Championship
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-wine-dark/80 p-1 rounded-xl border border-wine-border/60 mb-6">
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-burgundy-700 to-burgundy-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-burgundy-700 to-burgundy-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('admin'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'admin'
                ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40 shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-lg bg-red-950/70 border border-red-800/80 text-red-200 text-xs sm:text-sm flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3 rounded-lg bg-emerald-950/70 border border-emerald-800/80 text-emerald-200 text-xs sm:text-sm flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* FORM 1: CANDIDATE REGISTRATION */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-gray-300">
                  10-Digit SUC Code <span className="text-burgundy-400">*</span>
                </label>
                <span className={`text-[11px] font-mono-code ${sucCode.length === 10 ? 'text-emerald-400' : 'text-gray-400'}`}>
                  {sucCode.length}/10 digits
                </span>
              </div>
              <input
                type="text"
                maxLength={10}
                placeholder="e.g. 2452890430"
                value={sucCode}
                onChange={(e) => setSucCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2.5 bg-wine-dark/90 border border-wine-border rounded-xl text-white placeholder-gray-500 text-sm font-mono-code focus:outline-none focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Candidate Full Name <span className="text-burgundy-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Aryan Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-wine-dark/90 border border-wine-border rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Create Password <span className="text-burgundy-400">*</span>
              </label>
              <input
                type="password"
                placeholder="Minimum 4 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-wine-dark/90 border border-wine-border rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Confirm Password <span className="text-burgundy-400">*</span>
              </label>
              <input
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-wine-dark/90 border border-wine-border rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-burgundy-700 via-burgundy-600 to-burgundy-700 hover:from-burgundy-600 hover:to-burgundy-500 text-white font-semibold text-sm shadow-burgundy transition-all disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register as Candidate'}
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-gold-400 hover:underline font-medium"
              >
                Sign In
              </button>
            </p>
          </form>
        )}

        {/* FORM 2: CANDIDATE LOGIN */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-gray-300">
                  10-Digit SUC Code <span className="text-burgundy-400">*</span>
                </label>
                <span className={`text-[11px] font-mono-code ${sucCode.length === 10 ? 'text-emerald-400' : 'text-gray-400'}`}>
                  {sucCode.length}/10
                </span>
              </div>
              <input
                type="text"
                maxLength={10}
                placeholder="e.g. 2452890430"
                value={sucCode}
                onChange={(e) => setSucCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2.5 bg-wine-dark/90 border border-wine-border rounded-xl text-white placeholder-gray-500 text-sm font-mono-code focus:outline-none focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Password <span className="text-burgundy-400">*</span>
              </label>
              <input
                type="password"
                placeholder="Your secret password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-wine-dark/90 border border-wine-border rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-burgundy-700 via-burgundy-600 to-burgundy-700 hover:from-burgundy-600 hover:to-burgundy-500 text-white font-semibold text-sm shadow-burgundy transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Arena'}
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">
              Need to register first?{' '}
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className="text-gold-400 hover:underline font-medium"
              >
                Create Account
              </button>
            </p>
          </form>
        )}

        {/* FORM 3: ORGANIZER ADMIN LOGIN */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="p-3 rounded-lg bg-burgundy-950/60 border border-burgundy-800/60 mb-2">
              <p className="text-xs text-gold-300 font-medium">
                Fixed Organizer Panel for BCAlgorix administrators. Access live candidate logs, keystroke inspection, and reveal controls.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Admin Username
              </label>
              <input
                type="text"
                placeholder="admin"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                className="w-full px-4 py-2.5 bg-wine-dark/90 border border-wine-border rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Admin Password
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-wine-dark/90 border border-wine-border rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-gold-500 to-amber-600 hover:from-amber-500 hover:to-gold-400 text-black font-bold text-sm shadow-gold transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating Admin...' : 'Organizer Sign In'}
            </button>
            <p className="text-center text-[11px] text-gray-500 mt-2">
              Default preset: admin / admin@bcalgorix2026
            </p>
          </form>
        )}

      </div>
    </div>
  );
}
