import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

/* ── Landing Page Components ─────────────────────────────────────── */
import UtilityBar from './components/UtilityBar';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProblemStats from './components/ProblemStats';
import DataSourceEcosystem from './components/DataSourceEcosystem';
import Pipeline from './components/Pipeline';
import FeatureCards from './components/FeatureCards';
import ConfidencePreview from './components/ConfidencePreview';
import TechStack from './components/TechStack';
import Footer from './components/Footer';

/* ── Multi-Page Dashboard Architecture ─────────────────────────────── */
import DashboardLayout from './layouts/DashboardLayout';
import MapPage from './pages/dashboard/MapPage';
import AnalyticsPage from './pages/dashboard/AnalyticsPage';
import RecordsPage from './pages/dashboard/RecordsPage';
import ConflictsPage from './pages/dashboard/ConflictsPage';
import IngestionPage from './pages/dashboard/IngestionPage';

/**
 * ScrollToTop — Guarantees scroll position resets to (0, 0)
 * whenever navigating to the public landing page or upon route shifts.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname === '/') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [pathname]);

  return null;
}

/**
 * LandingPage — The existing marketing/informational page,
 * now wrapped in its own component for routing.
 * Starts cleanly from the top (0, 0).
 */
function LandingPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      
      <main>
        <Hero />
        <ProblemStats />
        <DataSourceEcosystem />
        <Pipeline />
        <FeatureCards />
        <ConfidencePreview />
        <TechStack />
      </main>
      
      <Footer />
    </div>
  );
}

/**
 * App — Root component with multi-page dashboard routing.
 * `/`                     → Public Landing Page
 * `/dashboard`            → Dedicated Interactive Cadastral Map View
 * `/dashboard/map`        → Dedicated Interactive Cadastral Map View (alias)
 * `/dashboard/analytics`  → Executive KPIs & Topology Diagnostics
 * `/dashboard/records`    → Land Revenue Records & RoR Registry
 * `/dashboard/conflicts`  → Flagged Spatial Conflicts & Encroachment Resolution
 * `/dashboard/ingestion`  → Data Ingestion & STAC Catalog Hub
 */
function App() {
  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<MapPage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="records" element={<RecordsPage />} />
            <Route path="conflicts" element={<ConflictsPage />} />
            <Route path="ingestion" element={<IngestionPage />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
