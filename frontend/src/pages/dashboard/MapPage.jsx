import React, { useState } from 'react';
import { Layers, Menu, X, Info, ChevronRight, Eye, RefreshCw, FileText, CheckSquare, Square } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import MapTabs from '../../components/dashboard/MapTabs';
import PlotInspectionPanel from '../../components/dashboard/PlotInspectionPanel';

const LAYER_GROUPS = [
  {
    title: 'Cadastral & AI Features',
    titleHi: 'कडस्ट्रल एवं एआई परतें',
    items: [
      { key: 'plots', label: 'Cadastral Plots (Parcels)', labelHi: 'कडस्ट्रल भू-खण्ड (खसरा)', color: '#3b82f6', count: 10 },
      { key: 'buildings', label: 'AI Detected Footprints', labelHi: 'एआई निर्मित भवन सीमाएं', color: '#22c55e', count: 48 },
      { key: 'conflicts', label: 'Flagged Spatial Encroachments', labelHi: 'स्थानिक अतिक्रमण / संघर्ष', color: '#ef4444', count: 8, alert: true },
    ],
  },
  {
    title: 'Multi-Department Layers',
    titleHi: 'बहु-विभागीय एकीकृत परतें',
    items: [
      { key: 'municipal', label: 'Municipal Master Plan Zoning', labelHi: 'नगर निगम मास्टर प्लान ज़ोन', color: '#a855f7', count: 4 },
      { key: 'utilities', label: 'Underground / Overhead Utilities', labelHi: 'उपयोगिता लाइनें (जल/विद्युत)', color: '#06b6d4', count: 5 },
      { key: 'gt', label: 'Ground Truthing Survey Points', labelHi: 'धरातलीय सत्यापन बिंदु (GT)', color: '#f97316', count: 10 },
      { key: 'gnss', label: 'GNSS / CORS Base Stations', labelHi: 'जीएनएसएस / कॉर्स स्टेशन', color: '#3b82f6', count: 5 },
    ],
  },
];

const MapPage = () => {
  const {
    layers,
    handleToggleLayer,
    selectedPlotId,
    handlePlotClick,
    setSelectedPlotId,
    language,
    sidebarOpen,
    setSidebarOpen,
  } = useDashboard();

  const [inspectorOpen, setInspectorOpen] = useState(true);

  // Quick select all / clear all
  const handleToggleAll = (enable) => {
    Object.keys(layers).forEach((key) => {
      if (layers[key] !== enable) {
        handleToggleLayer(key);
      }
    });
  };

  const activeCount = Object.values(layers).filter(Boolean).length;

  return (
    <div className="flex-1 flex flex-col w-full h-[calc(100vh-80px)] min-h-[680px] bg-[#f0f2f5] dark:bg-[#070e17] overflow-hidden">
      {/* Compact floating control strip — inside map area */}
      <div className="bg-white/90 dark:bg-[#0c1829]/90 backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-700/40 px-3 sm:px-5 py-1.5 flex items-center justify-between gap-2 select-none shrink-0">
        <div className="flex items-center gap-2">
          {/* Mobile layer drawer trigger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-200"
          >
            <Menu size={13} />
            <span>Layers ({activeCount}/7)</span>
          </button>

          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 hidden sm:inline">
            Tehsil Sadar · Lucknow Division
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {selectedPlotId && (
            <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded text-blue-800 dark:text-blue-300 font-mono text-[11px]">
              <span>PARCEL: <strong>{selectedPlotId}</strong></span>
              <button
                onClick={() => setSelectedPlotId(null)}
                className="hover:text-red-500 ml-1 text-slate-400"
                title="Deselect Plot"
              >
                <X size={11} />
              </button>
            </div>
          )}

          <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            <span>1:2,500</span>
            <span>·</span>
            <span>WGS84</span>
          </div>
        </div>
      </div>

      {/* Main Workspace: Left Sidebar + Map Viewport + Right Inspector Drawer */}
      <div className="flex-1 flex w-full relative overflow-hidden">
        {/* Desktop Utilitarian Layer Sidebar */}
        <aside className="hidden lg:flex flex-col w-72 shrink-0 bg-white dark:bg-[#0c1829] border-r border-slate-300 dark:border-slate-800 select-none overflow-y-auto z-10 shadow-sm">
          {/* Sidebar Header */}
          <div className="p-3 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-300 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={15} className="text-gov-navy dark:text-teal-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                {language === 'hi' ? 'मानचित्र परतें' : 'Map Layers & Datasets'}
              </span>
            </div>
            <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              {activeCount} Active
            </span>
          </div>

          {/* Quick Select Buttons */}
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <button
              onClick={() => handleToggleAll(true)}
              className="text-blue-700 dark:text-blue-400 hover:underline font-medium"
            >
              Select All
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              onClick={() => handleToggleAll(false)}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
            >
              Clear All
            </button>
          </div>

          {/* Layer Checkboxes */}
          <div className="p-3 space-y-4 flex-1">
            {LAYER_GROUPS.map((group) => (
              <div key={group.title} className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-2.5">
                <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 pb-1 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <span>{language === 'hi' ? group.titleHi : group.title}</span>
                </div>
                <div className="space-y-1.5">
                  {group.items.map((item) => {
                    const isChecked = layers[item.key];
                    return (
                      <label
                        key={item.key}
                        className={`flex items-center justify-between gap-2 p-1.5 cursor-pointer border transition-colors text-xs select-none ${
                          isChecked
                            ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 shadow-[0_1px_1px_rgba(0,0,0,0.04)]'
                            : 'bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleLayer(item.key)}
                            className="rounded-none border-slate-400 text-gov-navy focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span
                            className="w-2.5 h-2.5 shrink-0 border border-black/20"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="truncate font-medium text-[11px]" title={item.label}>
                            {language === 'hi' ? item.labelHi : item.label}
                          </span>
                        </div>
                        <span className={`text-[9px] font-mono px-1 border shrink-0 ${
                          item.alert
                            ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-300 font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}>
                          {item.count}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Helper Notes */}
          <div className="p-3 bg-slate-100 dark:bg-slate-900 border-t border-slate-300 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Info size={13} className="text-blue-600" />
              <span>Map Navigation Guide:</span>
            </p>
            <p className="text-[10px] leading-relaxed">
              • Click any <strong>blue cadastral plot</strong> to open legal attributes & area audit.<br />
              • Click <strong>red overlays</strong> to inspect flagged spatial encroachments.<br />
              • Switch tabs above map for <strong>3D DSM</strong> and <strong>Temporal Change</strong>.
            </p>
          </div>
        </aside>

        {/* Mobile Sidebar Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-[2000] lg:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute left-0 top-0 h-full w-[85vw] max-w-xs bg-white dark:bg-slate-900 border-r border-slate-300 dark:border-slate-800 shadow-2xl flex flex-col">
              <div className="p-3 bg-gov-navy text-white flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider">Map Layers & Datasets</span>
                <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-white/10">
                  <X size={18} />
                </button>
              </div>
              <div className="p-3 space-y-4 flex-1 overflow-y-auto">
                {LAYER_GROUPS.map((group) => (
                  <div key={group.title} className="border border-slate-300 dark:border-slate-700 p-2">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">
                      {language === 'hi' ? group.titleHi : group.title}
                    </p>
                    <div className="space-y-2">
                      {group.items.map((item) => (
                        <label key={item.key} className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={layers[item.key]}
                            onChange={() => handleToggleLayer(item.key)}
                            className="rounded-none w-4 h-4 text-gov-navy"
                          />
                          <span className="w-3 h-3 shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="flex-1">{item.label}</span>
                          <span className="font-mono text-[10px] text-slate-400">({item.count})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        )}

        {/* Center: Full-height Map Workspace */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100 dark:bg-slate-950 relative">
          <MapTabs
            mapProps={{
              layers,
              selectedPlotId,
              onPlotClick: (plotId) => {
                handlePlotClick(plotId);
                setInspectorOpen(true);
              },
            }}
          />
        </main>

        {/* Right Docked Plot Inspection Dossier (Slides in when plot selected) */}
        {selectedPlotId && inspectorOpen && (
          <aside className="w-80 sm:w-96 shrink-0 bg-white dark:bg-[#0c1829] border-l-2 border-slate-300 dark:border-slate-800 flex flex-col shadow-lg z-10 transition-all">
            {/* Inspector Header */}
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-gov-navy dark:text-teal-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Cadastral Dossier · {selectedPlotId}
                </span>
              </div>
              <button
                onClick={() => setSelectedPlotId(null)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                title="Close Inspector"
              >
                <X size={15} />
              </button>
            </div>

            {/* Inspector Content */}
            <div className="flex-1 overflow-y-auto p-3">
              <PlotInspectionPanel selectedPlotId={selectedPlotId} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default MapPage;
