import React, { useState, useCallback } from 'react';
import { Menu } from 'lucide-react';
import TopBar from '../components/dashboard/TopBar';
import KpiRow from '../components/dashboard/KpiRow';
import TopologyRow from '../components/dashboard/TopologyRow';
import LayerSidebar from '../components/dashboard/LayerSidebar';
import MapTabs from '../components/dashboard/MapTabs';
import PlotInspectionPanel from '../components/dashboard/PlotInspectionPanel';
import ConflictsTable from '../components/dashboard/ConflictsTable';
import IngestionHub from '../components/dashboard/IngestionHub';
import Toast from '../components/dashboard/Toast';
import { useDashboard } from '../context/DashboardContext';

/**
 * Dashboard — Main operational dashboard page.
 * Orchestrates all dashboard components and manages shared state.
 */
const Dashboard = () => {
  const {
    layers,
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
    kpis,
    repaired,
    snapped,
    plotsCount,
  } = useDashboard();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Top bar */}
      <TopBar onRerun={handleRerunEngine} isRunning={engineRunning} />

      {/* KPI and Topology rows */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-[1920px] mx-auto">
          <KpiRow kpis={kpis} />
          <TopologyRow
            plotsCount={plotsCount}
            repaired={repaired}
            snapped={snapped}
          />
        </div>
      </div>

      {/* Mobile sidebar toggle */}
      <div className="lg:hidden px-3 sm:px-4 pt-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center justify-between w-full sm:w-auto gap-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Menu size={16} className="text-teal-600 dark:text-teal-400" />
            <span>Map Layers & Ingestion</span>
          </div>
          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-semibold border border-slate-200 dark:border-slate-700">
            {Object.values(layers).filter(Boolean).length} Active
          </span>
        </button>
      </div>

      {/* Main content: Sidebar + Map/Panels */}
      <div className="flex-1 flex max-w-[1920px] mx-auto w-full">
        {/* Sidebar */}
        <LayerSidebar
          layers={layers}
          onToggle={handleToggleLayer}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        >
          <IngestionHub
            onIngestSuccess={() =>
              setToast({
                message: 'Spatial layers updated with freshly ingested features.',
                type: 'success',
              })
            }
          />
        </LayerSidebar>

        {/* Main panel */}
        <main className="flex-1 p-2.5 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto w-full">
          {/* Map with tabs (2D / 3D / Temporal) */}
          <div className="h-[420px] sm:h-[500px] lg:h-[580px]">
            <MapTabs
              mapProps={{
                layers,
                selectedPlotId,
                onPlotClick: handlePlotClick,
              }}
            />
          </div>

          {/* Plot Inspection Panel */}
          <PlotInspectionPanel selectedPlotId={selectedPlotId} />

          {/* Conflicts Table */}
          <ConflictsTable
            onRowClick={handlePlotClick}
            selectedPlotId={selectedPlotId}
          />
        </main>
      </div>

      {/* Global Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
