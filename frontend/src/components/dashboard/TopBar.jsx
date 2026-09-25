import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';

/**
 * TopBar — Dashboard header bar with product wordmark and "Re-run Conflict Engine" button.
 * Mirrors the top section of app.py (lines 110-118).
 */
const TopBar = ({ onRerun, isRunning }) => {
  return (
    <header className="bg-navy-900 dark:bg-slate-900 border-b border-navy-700 dark:border-slate-800 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between sticky top-0 z-[2000] transition-colors duration-200">
      {/* Product wordmark — matches the landing page Navbar */}
      <Link to="/" className="flex items-center gap-2 group">
        <span className="text-white text-lg sm:text-xl font-bold tracking-tight group-hover:text-teal-300 transition-colors">
          Drishti <span className="text-teal-400">AI</span>
        </span>
        <span className="text-[10px] text-slate-400 border border-slate-600 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
          Dashboard
        </span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle (Moon / Sun) */}
        <ThemeToggle />

        {/* Re-run Conflict Engine — amber/primary action */}
        <button
          onClick={onRerun}
          disabled={isRunning}
          className="flex items-center gap-1.5 sm:gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/60 disabled:cursor-not-allowed text-navy-900 font-semibold text-xs sm:text-sm px-2.5 sm:px-4 py-1.5 sm:py-2 rounded shadow-md transition-all duration-200 whitespace-nowrap"
        >
          <RefreshCw size={15} className={`shrink-0 ${isRunning ? 'animate-spin' : ''}`} />
          <span>
            {isRunning ? 'Running…' : (
              <>
                Re-run <span className="hidden sm:inline">Conflict </span>Engine
              </>
            )}
          </span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
