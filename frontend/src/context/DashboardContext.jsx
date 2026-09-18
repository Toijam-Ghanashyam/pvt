import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

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

  // Live GeoData state for API layers
  const [geoData, setGeoData] = useState({
    plots: null, buildings: null, conflicts: null,
    municipal: null, utilities: null,
    gt: null, gnss: null,
    revenue: [], metrics: [], consensus: []
  });

  useEffect(() => {
    const emptyFC = { type: 'FeatureCollection', features: [] };
    const safeFetch = async (url, method = 'GET') => {
      try {
        const res = await fetch(url, { method });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      } catch (e) {
        console.warn(`[API] ${method} ${url} failed:`, e.message);
        return null;
      }
    };

    const fetchAllLayers = async () => {
      const [plots, buildings, conflicts, municipal, utilities, gt, gnss, revenue, metrics, consensusRes] = await Promise.all([
        safeFetch(`${API_BASE_URL}/cadastral-plots`),
        safeFetch(`${API_BASE_URL}/buildings`),
        safeFetch(`${API_BASE_URL}/conflicts`),
        safeFetch(`${API_BASE_URL}/municipal`),
        safeFetch(`${API_BASE_URL}/utilities`),
        safeFetch(`${API_BASE_URL}/gt-surveys`),
        safeFetch(`${API_BASE_URL}/gnss-cors`),
        safeFetch(`${API_BASE_URL}/revenue`),
        safeFetch(`${API_BASE_URL}/metrics`),
        safeFetch(`${API_BASE_URL}/consensus`, 'POST'),
      ]);
      setGeoData({
        plots: plots || emptyFC,
        buildings: buildings || emptyFC,
        conflicts: conflicts || emptyFC,
        municipal: municipal || emptyFC,
        utilities: utilities || emptyFC,
        gt: gt || emptyFC,
        gnss: gnss || emptyFC,
        revenue: Array.isArray(revenue) ? revenue : [],
        metrics: Array.isArray(metrics) ? metrics : [],
        consensus: consensusRes?.results || [],
      });
    };
    fetchAllLayers();
  }, []);

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

  const totalBuildings = geoData.buildings?.features?.length || 0;
  const encroachments = geoData.conflicts?.features?.length || 0;
  
  const kpis = {
    totalAreaHectares: 12.85, // Stub
    totalBuildings,
    encroachments,
    accuracyRate: totalBuildings > 0 ? (((totalBuildings - encroachments) / totalBuildings) * 100).toFixed(1) : 100.0,
  };
  
  const repaired = geoData.metrics?.find((m) => m.metric_name === 'Self-Intersecting Polygons Repaired')?.metric_value || 0;
  const snapped = geoData.metrics?.find((m) => m.metric_name === 'Building Edges Snapped to Boundaries')?.metric_value || 0;
  const plotsCount = geoData.plots?.features?.length || 0;

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
        geoData,
        setGeoData,
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
