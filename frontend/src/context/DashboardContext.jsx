import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { computeKPIs, topologyMetrics, plotsGeoJSON } from '../data/mockData';

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  // Layer visibility toggles (default all active)
  const [layers, setLayers] = useState({
    plots: true,
    buildings: true,
    conflicts: true,
    municipal: true,
    utilities: true,
    gt: true,
    gnss: true,
  });

  // Selected plot ID for cross-page navigation & inspection
  const [selectedPlotId, setSelectedPlotId] = useState(null);

  // Mobile sidebar drawer state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Re-run conflict engine state
  const [engineRunning, setEngineRunning] = useState(false);

  // Global toast notification
  const [toast, setToast] = useState(null);

  // Font scale accessibility: 'sm' | 'base' | 'lg'
  const [fontScale, setFontScale] = useState('base');

  // Language: 'en' | 'hi'
  const [language, setLanguage] = useState('en');

  // Apply fontScale class to documentElement
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-scale-sm', 'font-scale-base', 'font-scale-lg');
    root.classList.add(`font-scale-${fontScale}`);
  }, [fontScale]);

  const handleToggleLayer = useCallback((layerKey) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  }, []);

  const handlePlotClick = useCallback((plotId) => {
    setSelectedPlotId(plotId);
  }, []);

  const handleRerunEngine = useCallback(() => {
    setEngineRunning(true);
    setTimeout(() => {
      setEngineRunning(false);
      setToast({
        message: 'Spatial Conflict Engine executed successfully — 8 active conflicts re-analyzed.',
        type: 'success',
      });
    }, 2000);
  }, []);

  const kpis = computeKPIs();
  const repaired =
    topologyMetrics.find((m) => m.metric_name === 'Self-Intersecting Polygons Repaired')?.metric_value || 0;
  const snapped =
    topologyMetrics.find((m) => m.metric_name === 'Building Edges Snapped to Boundaries')?.metric_value || 0;
  const plotsCount = plotsGeoJSON.features.length;

  return (
    <DashboardContext.Provider
      value={{
        layers,
        setLayers,
        handleToggleLayer,
        selectedPlotId,
        setSelectedPlotId,
        handlePlotClick,
        sidebarOpen,
        setSidebarOpen,
        engineRunning,
        handleRerunEngine,
        toast,
        setToast,
        fontScale,
        setFontScale,
        language,
        setLanguage,
        kpis,
        repaired,
        snapped,
        plotsCount,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export default DashboardContext;
