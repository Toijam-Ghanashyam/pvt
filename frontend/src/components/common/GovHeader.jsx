import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { RefreshCw, Map, BarChart3, FileText, AlertTriangle, UploadCloud, Home, ChevronRight } from 'lucide-react';
import { AshokaLionCapital } from './GovEmblems';
import ThemeToggle from '../ThemeToggle';
import { useDashboard } from '../../context/DashboardContext';

/**
 * GovHeader — Consolidated Government Header.
 * BEFORE: 7 horizontal rows consuming ~310px (53% of viewport).
 * AFTER:  3 rows consuming ~80px (14% of viewport).
 *
 * Structure:
 *  1. Tricolor bar (4px)
 *  2. Merged Smart Header: brand + nav tabs + controls (one row ~50px)
 *  3. Slim breadcrumb/context bar (~24px)
 */

const NAV_ITEMS = [
  { path: '/dashboard', exact: true, label: 'Map', labelHi: 'मानचित्र', icon: Map },
  { path: '/dashboard/analytics', label: 'Analytics', labelHi: 'सांख्यिकी', icon: BarChart3 },
  { path: '/dashboard/records', label: 'Records', labelHi: 'अभिलेख', icon: FileText },
  { path: '/dashboard/conflicts', label: 'Conflicts', labelHi: 'विवाद', icon: AlertTriangle, badge: 8 },
  { path: '/dashboard/ingestion', label: 'Ingestion', labelHi: 'डेटा', icon: UploadCloud },
];

const GovHeader = () => {
  const {
    fontScale,
    setFontScale,
    language,
    setLanguage,
    engineRunning,
    handleRerunEngine,
    layers,
  } = useDashboard();

  const location = useLocation();
  const activeTabRef = React.useRef(null);
  const activeLayersCount = Object.values(layers).filter(Boolean).length;

  // Determine current page label for breadcrumb
  const currentNav = NAV_ITEMS.find((item) =>
    item.exact ? (location.pathname === item.path || location.pathname === '/dashboard/map') : location.pathname.startsWith(item.path)
  ) || NAV_ITEMS[0];

  // Auto-scroll active tab into view
  React.useEffect(() => {
    if (activeTabRef.current?.parentElement) {
      const container = activeTabRef.current.parentElement;
      const scrollLeft = activeTabRef.current.offsetLeft - (container.clientWidth / 2) + (activeTabRef.current.clientWidth / 2);
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [location.pathname]);

  // Scroll to content on tab click
  const handleTabClick = () => {
    const el = document.getElementById('main-content');
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <header className="w-full flex flex-col select-none z-[1010] relative">
      {/* 1. Tricolor Bar */}
      <div className="india-tricolor-bar" />

      {/* 2. Merged Smart Header — Brand + Nav Tabs + Controls */}
      <div className="bg-[#112e51] dark:bg-[#0a1b30] text-white border-b border-[#1b3a63] px-3 sm:px-5 shadow-md transition-colors">
        <div className="max-w-[1920px] mx-auto flex items-center h-12 sm:h-14 gap-3">

          {/* Brand */}
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
            className="shrink-0 flex items-center gap-2 group hover:opacity-90 transition-opacity"
            title="Return to Public Portal"
          >
            <AshokaLionCapital className="w-7 h-9 sm:w-8 sm:h-10 text-white" />
            <div className="hidden sm:flex flex-col">
              <span className="text-sm sm:text-base font-bold tracking-tight leading-tight">
                Drishti <span className="text-amber-400">AI</span>
              </span>
              <span className="text-[9px] text-slate-400 leading-tight">DoLR · SIH 2026</span>
            </div>
          </Link>

          <div className="h-8 w-px bg-slate-500/30 shrink-0 hidden sm:block" />

          {/* Nav Tabs (inline) */}
          <nav className="flex items-stretch overflow-x-auto scrollbar-none flex-1 min-w-0 -my-px" aria-label="Dashboard Navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isMap = item.exact;
              const isActive = isMap
                ? location.pathname === '/dashboard' || location.pathname === '/dashboard/map'
                : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  ref={isActive ? activeTabRef : null}
                  to={item.path}
                  end={item.exact}
                  onClick={handleTabClick}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-1 text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-200 border-b-2 relative ${isActive
                    ? 'text-amber-300 border-b-gov-saffron bg-white/5'
                    : 'text-slate-300 border-b-transparent hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon size={14} className={isActive ? 'text-amber-300' : 'text-slate-400'} />
                  <span>{language === 'hi' ? item.labelHi : item.label}</span>

                </NavLink>
              );
            })}
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
            {/* Font Size (desktop only) */}
            <div className="hidden lg:flex items-center border border-slate-500/30 bg-slate-900/40 rounded text-[10px]">
              {['sm', 'base', 'lg'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFontScale(s)}
                  className={`px-1.5 py-0.5 font-semibold transition-colors ${fontScale === s ? 'text-amber-400 bg-slate-800/60' : 'text-slate-400 hover:text-white'
                    } ${s === 'base' ? 'border-x border-slate-500/30 text-[11px]' : s === 'lg' ? 'text-[12px]' : ''}`}
                  aria-label={`Font size ${s}`}
                >
                  A{s === 'sm' ? '-' : s === 'lg' ? '+' : ''}
                </button>
              ))}
            </div>

            {/* Language Toggle */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="hidden sm:block text-[10px] font-bold text-slate-300 hover:text-amber-300 transition-colors border border-slate-500/30 bg-slate-900/40 px-2 py-1 rounded"
            >
              {language === 'en' ? 'हिन्दी' : 'EN'}
            </button>

            <ThemeToggle />

            {/* Engine Button */}
            <button
              onClick={handleRerunEngine}
              disabled={engineRunning}
              className="inline-flex items-center gap-1.5 bg-gov-saffron hover:bg-amber-600 disabled:bg-amber-500/60 disabled:cursor-not-allowed text-[#0b1e36] font-bold text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 rounded border border-amber-400/60 shadow-sm transition-colors cursor-pointer whitespace-nowrap"
              title="Re-run Spatial Conflict Detection"
            >
              <RefreshCw size={13} className={`shrink-0 ${engineRunning ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{engineRunning ? 'Analyzing…' : 'Re-run Engine'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Slim Contextual Breadcrumb Bar */}
      <div className="bg-[#09182b] dark:bg-[#050f1d] border-b border-[#142d4f] px-3 sm:px-5 py-1 text-[11px] text-slate-300">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <Link
              to="/"
              className="text-slate-400 hover:text-white transition-colors"
              title="Return to Public Portal"
            >
              <Home size={12} />
            </Link>
            <ChevronRight size={10} className="text-slate-600" />
            <span className="text-slate-400">DoLR</span>
            <ChevronRight size={10} className="text-slate-600" />
            <span className="text-slate-400">Drishti AI</span>
            <ChevronRight size={10} className="text-slate-600" />
            <span className="text-amber-300 font-semibold">
              {language === 'hi' ? currentNav.labelHi : currentNav.label}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">ENGINE ONLINE</span>
            </span>
            <span className="hidden md:inline">REGION: LUCKNOW URBAN (ZONE 4)</span>
            <span className="hidden lg:inline">EPSG: 4326 · WGS 84</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default GovHeader;
