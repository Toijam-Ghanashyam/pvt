import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * ThemeToggle — Moon/Sun button for switching between dark and light mode.
 * Default is light (shows Moon icon to switch to dark).
 * In dark mode, shows Sun icon to return to light.
 */
const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`p-2 rounded-lg border transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-teal-500/50 ${
        isDark
          ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700 hover:text-amber-300'
          : 'bg-navy-700/60 border-navy-600 text-slate-200 hover:bg-navy-700 hover:text-white'
      } ${className}`}
    >
      {isDark ? (
        <Sun size={18} className="transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon size={18} className="transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
};

export default ThemeToggle;
