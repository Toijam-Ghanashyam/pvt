import React from 'react';
import { Wrench, Scissors, Magnet, HeartPulse } from 'lucide-react';

/**
 * TopologyRow — Automated Topology Diagnostics (4 cards, subtler style).
 * Mirrors app.py lines 130-146.
 */
const TopologyRow = ({ plotsCount, repaired, snapped }) => {
  const cards = [
    { label: 'Plots Processed', value: plotsCount, sub: '+100% Coverage', icon: Wrench },
    { label: 'Slivers & Invalid Geometries Fixed', value: repaired, sub: 'Auto-corrected', icon: Scissors },
    { label: 'Building Edges Auto-Snapped', value: snapped, sub: '5m tolerance', icon: Magnet },
    { label: 'Spatial Health Score', value: '99.8%', sub: '+1.2% Post-Correction', icon: HeartPulse },
  ];

  return (
    <section className="px-3 sm:px-6 pb-3 sm:pb-4">
      <h2 className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1.5 sm:mb-3">
        🛠️ Automated Topology Diagnostics & Health
      </h2>
      <p className="text-[11px] sm:text-xs text-slate-400 mb-2.5 sm:mb-3">
        Real-time auto-correction metrics for ingested spatial data prior to conflict analysis.
      </p>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-2 sm:p-3 hover:bg-white dark:hover:bg-slate-800 transition-colors duration-200"
            >
              <div className="flex items-center gap-1.5 mb-1 sm:mb-1.5">
                <Icon size={13} className="text-slate-400 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide leading-tight truncate">
                  {card.label}
                </span>
              </div>
              <p className="text-base sm:text-xl font-bold text-slate-700 dark:text-slate-200">{card.value}</p>
              <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500">{card.sub}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TopologyRow;
