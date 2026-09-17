import React, { useState } from 'react';
import { Map, Cuboid, Clock } from 'lucide-react';

/**
 * MapTabs — 3-tab wrapper around the existing MapView and two new views.
 * Tabs are now a floating overlay pill in the top-right of the map viewport
 * to maximize vertical content space.
 *
 * Tab 1: "2D GIS Integration View" (existing MapView, unchanged)
 * Tab 2: "3D Elevation Inspector (DSM)"
 * Tab 3: "Temporal Change Detection"
 *
 * Props:
 *  - mapProps: passed through to MapView (layers, selectedPlotId, onPlotClick)
 */

import MapView from './MapView';
import ElevationView from './ElevationView';
import TemporalCompareView from './TemporalCompareView';

const TABS = [
  { id: '2d', label: '2D View', icon: Map },
  { id: '3d', label: '3D DSM', icon: Cuboid },
  { id: 'temporal', label: 'Temporal', icon: Clock },
];

const MapTabs = ({ mapProps }) => {
  const [activeTab, setActiveTab] = useState('2d');

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Floating tab pills — overlaid on top-right of map */}
      <div className="absolute top-3 right-3 z-[500] flex bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-200/60 dark:border-slate-700/50 shadow-lg overflow-hidden">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gov-navy dark:bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={13} className="shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content — takes full height */}
      <div className="flex-1 w-full h-full relative min-h-[520px]">
        {activeTab === '2d' && <MapView {...mapProps} />}
        {activeTab === '3d' && <ElevationView />}
        {activeTab === 'temporal' && <TemporalCompareView />}
      </div>
    </div>
  );
};

export default MapTabs;
