import React from 'react';
import { TrendingUp, Building2, AlertTriangle, Target } from 'lucide-react';

/**
 * KpiRow — Executive KPI Summary (4 cards).
 * Mirrors app.py lines 120-126: Total Area, Buildings, Encroachments (alert), Accuracy.
 */
const KpiRow = ({ kpis }) => {
  const cards = [
    {
      label: 'Total Area Integrated',
      value: `${kpis.totalAreaHectares} ha`,
      icon: TrendingUp,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/30',
    },
    {
      label: 'Total Buildings Extracted',
      value: kpis.totalBuildings.toLocaleString(),
      icon: Building2,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    {
      label: 'Encroachments Flagged',
      value: kpis.encroachments.toLocaleString(),
      icon: AlertTriangle,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      isAlert: true,
    },
    {
      label: 'Spatial Accuracy Rate',
      value: `${kpis.accuracyRate}%`,
      icon: Target,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
    },
  ];

  return (
    <section className="px-3 sm:px-6 py-3 sm:py-4">
      <h2 className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 sm:mb-3">
        📊 Executive KPI Summary
      </h2>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`rounded-lg border p-3 sm:p-4 transition-all duration-200 hover:shadow-lg ${
                card.isAlert
                  ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/40 dark:border-amber-500/50 ring-1 ring-amber-500/20'
                  : `bg-white dark:bg-slate-800/80 ${card.borderColor} dark:border-slate-700`
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 sm:mb-2 gap-1">
                <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide leading-tight">
                  {card.label}
                </span>
                <div className={`p-1 sm:p-1.5 rounded-md shrink-0 ${card.bgColor}`}>
                  <Icon size={14} className={`sm:w-4 sm:h-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-white">{card.value}</p>
              {card.isAlert && (
                <span className="inline-block mt-1 sm:mt-2 text-[10px] sm:text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-1.5 sm:px-2 py-0.5 rounded-full">
                  ⚠ Requires Review
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default KpiRow;
