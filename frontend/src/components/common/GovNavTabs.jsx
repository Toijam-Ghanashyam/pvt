import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Map, BarChart3, FileText, AlertTriangle, UploadCloud, ChevronRight, Home, Layers } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

/**
 * GovNavTabs — Rigid, utilitarian navigation bar for the multi-page dashboard.
 * Styled after official portals like india.gov.in and bhunaksha.nic.in.
 */

const NAV_ITEMS = [
  {
    path: '/dashboard',
    exact: true,
    labelEn: 'Interactive Cadastral Map',
    labelHi: 'कडस्ट्रल भू-मानचित्र',
    icon: Map,
    badgeKey: 'layers',
  },
  {
    path: '/dashboard/analytics',
    labelEn: 'Executive KPIs & Analytics',
    labelHi: 'सांख्यिकी एवं स्वास्थ्य',
    icon: BarChart3,
  },
  {
    path: '/dashboard/records',
    labelEn: 'Land Revenue Records (RoR)',
    labelHi: 'भू-अभिलेख एवं खसरा',
    icon: FileText,
  },
  {
    path: '/dashboard/conflicts',
    labelEn: 'Flagged Spatial Conflicts',
    labelHi: 'स्थानिक अतिक्रमण एवं विवाद',
    icon: AlertTriangle,
    badgeKey: 'conflicts',
  },
  {
    path: '/dashboard/ingestion',
    labelEn: 'Data Ingestion Hub',
    labelHi: 'डेटा अंतर्ग्रहण एवं स्रोत',
    icon: UploadCloud,
  },
];

const GovNavTabs = () => {
  const location = useLocation();
  const { language, layers } = useDashboard();
  const activeTabRef = React.useRef(null);

  // Active layer count for the map badge
  const activeLayersCount = Object.values(layers).filter(Boolean).length;

  // Determine current page label for breadcrumb
  const currentNav =
    NAV_ITEMS.find((item) =>
      item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
    ) || NAV_ITEMS[0];

  // Auto-scroll active tab into view horizontally on smaller/overflowing screens
  React.useEffect(() => {
    if (activeTabRef.current && activeTabRef.current.parentElement) {
      const container = activeTabRef.current.parentElement;
      const scrollLeft = activeTabRef.current.offsetLeft - (container.clientWidth / 2) + (activeTabRef.current.clientWidth / 2);
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth',
      });
    }
  }, [location.pathname]);

  // Click handler to immediately scroll down to main content so navbar is not shown
  const handleTabClick = () => {
    const contentElement = document.getElementById('main-content');
    if (contentElement) {
      const targetTop = contentElement.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
  };

  return (
    <div id="dashboard-nav-tabs" className="relative w-full bg-[#0d223f] dark:bg-[#071526] border-b border-[#1b3a63] select-none">
      <div className="max-w-[1920px] mx-auto">
        {/* Horizontal Navigation Tabs (Scrollable on small screens) */}
        <nav className="flex items-stretch overflow-x-auto scrollbar-none px-2 sm:px-6" aria-label="Dashboard Sub-pages">
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
                className={`flex items-center gap-2 px-3 sm:px-5 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors border-r border-[#1b3a63] first:border-l relative ${isActive
                  ? 'bg-[#183a69] text-amber-300 border-b-4 border-b-gov-saffron font-bold'
                  : 'text-slate-200 hover:text-white hover:bg-[#11294c] border-b-4 border-b-transparent'
                  }`}
              >
                <Icon size={16} className={isActive ? 'text-amber-300' : 'text-slate-300'} />
                <span>{language === 'hi' ? item.labelHi : item.labelEn}</span>

                {/* Layer count badge for Map tab */}
                {item.badgeKey === 'layers' && (
                  <span className="ml-1 text-[10px] font-mono bg-[#0b1c33] text-teal-300 px-1.5 py-0.2 border border-[#20497e]">
                    {activeLayersCount}/7
                  </span>
                )}

                {/* Alert badge for Conflicts tab */}

              </NavLink>
            );
          })}

          {/* Quick link to Portal Landing Page */}
          <NavLink
            to="/"
            onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
            className="flex items-center gap-1.5 px-4 py-3 text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#11294c] border-r border-[#1b3a63] ml-auto whitespace-nowrap hidden lg:flex"
            title="Return to Public Portal Home"
          >
            <Home size={14} />
            <span>Public Portal</span>
          </NavLink>
        </nav>

        {/* Utilitarian Government Breadcrumbs & Region Banner */}
        <div className="bg-[#09182b] dark:bg-[#050f1d] border-t border-[#142d4f] px-3 sm:px-6 py-1.5 text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium flex-wrap">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Click to view full Government Portal Banner"
            >
              Header ↑
            </button>
            <ChevronRight size={12} className="text-slate-500" />
            <span className="text-slate-400">DoLR</span>
            <ChevronRight size={12} className="text-slate-500" />
            <span className="text-slate-400">Drishti AI</span>
            <ChevronRight size={12} className="text-slate-500" />
            <span className="text-amber-300 font-semibold">
              {language === 'hi' ? currentNav.labelHi : currentNav.labelEn}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
            <span>REGION: LUCKNOW URBAN BELT (ZONE 4)</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">EPSG: 4326 · WGS 84</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovNavTabs;
