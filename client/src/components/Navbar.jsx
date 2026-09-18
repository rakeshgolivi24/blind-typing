import React from 'react';
import { Keyboard, Trophy, ShieldAlert, LogOut, User as UserIcon, LayoutDashboard, Crown } from 'lucide-react';

export default function Navbar({ user, admin, currentView, setView, onLogout }) {
  return (
    <nav className="border-b border-wine-border/60 bg-wine-dark/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Fest Brand */}
          <div 
            onClick={() => setView(admin ? 'admin' : (user ? 'dashboard' : 'auth'))}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-burgundy-600 via-burgundy-800 to-wine-dark flex items-center justify-center border border-burgundy-500/40 shadow-burgundy group-hover:scale-105 transition-transform duration-200">
              <Keyboard className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-fest text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-amber-200">
                  BCAlgorix
                </span>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-burgundy-900/80 text-burgundy-200 rounded border border-burgundy-700/50">
                  Fest 2026
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium tracking-wide">
                Blind Typing Championship
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Candidate Dashboard */}
            {user && (
              <button
                onClick={() => setView('dashboard')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentView === 'dashboard'
                    ? 'bg-burgundy-900/70 text-gold-300 border border-burgundy-700/60 shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-wine-card'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-burgundy-400" />
                <span className="hidden sm:inline">Rounds Arena</span>
              </button>
            )}

            {/* Admin Portal Button */}
            {admin && (
              <button
                onClick={() => setView('admin')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentView === 'admin'
                    ? 'bg-burgundy-900/70 text-gold-300 border border-burgundy-700/60 shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-wine-card'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-burgundy-400" />
                <span>Admin Suite</span>
              </button>
            )}

            {/* Leaderboard Button */}
            <button
              onClick={() => setView('leaderboard')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'leaderboard'
                  ? 'bg-burgundy-900/70 text-gold-300 border border-burgundy-700/60 shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-wine-card'
              }`}
            >
              <Trophy className="w-4 h-4 text-gold-400" />
              <span>Leaderboard</span>
            </button>

            {/* Authentication Badges & Actions */}
            {user ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-wine-border/70">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-sm font-semibold text-gray-200 truncate max-w-[140px]">
                    {user.name}
                  </span>
                  <span className="text-[11px] font-mono-code text-gold-400/90 tracking-wide">
                    SUC: {user.sucCode}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-lg bg-burgundy-900/60 border border-burgundy-700/50 flex items-center justify-center text-gold-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-wine-card transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : admin ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-wine-border/70">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-sm font-semibold text-gold-300 flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-gold-400" /> Fest Organizer
                  </span>
                  <span className="text-[11px] font-mono-code text-burgundy-300">
                    Admin Active
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign Out Admin"
                  className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-wine-card transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-2">
                <button
                  onClick={() => setView('auth')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-burgundy-700 to-burgundy-600 hover:from-burgundy-600 hover:to-burgundy-500 text-white shadow-burgundy transition-all"
                >
                  Sign In / Register
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </nav>
  );
}
