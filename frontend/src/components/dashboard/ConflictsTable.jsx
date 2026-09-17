import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, Building2 } from 'lucide-react';
import { conflictsGeoJSON } from '../../data/mockData';
import RevenueOfficeModal from './RevenueOfficeModal';

/**
 * ConflictsTable — Sortable table of all flagged conflicts.
 * Mirrors the conflicts display in app.py with colored confidence badges.
 *
 * Requirements:
 *  - If confidence < 78%: Status is "Recommended Human Review" (rendered as an interactive
 *    link connecting to nearest jurisdictional revenue office).
 *  - If confidence < 50%: Highlighted in Red.
 *  - If 50% <= confidence < 78%: Highlighted in Yellow/Amber.
 *  - Action button below the table: "Contact Jurisdictional Land Revenue Officer".
 */

/* ── Confidence badge color logic ──────────────────────────────────── */
const getConfidenceBadge = (score) => {
  if (score >= 78) {
    return {
      text: 'High',
      bg: 'bg-emerald-100 dark:bg-emerald-950/60',
      fg: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    };
  }
  if (score >= 50) {
    return {
      text: 'Medium',
      bg: 'bg-amber-100 dark:bg-amber-950/60',
      fg: 'text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500',
    };
  }
  return {
    text: 'Low',
    bg: 'bg-red-100 dark:bg-red-950/60',
    fg: 'text-red-700 dark:text-red-300',
    dot: 'bg-red-500',
  };
};

const ConflictsTable = ({ onRowClick, selectedPlotId }) => {
  const [sortKey, setSortKey] = useState('confidence_score');
  const [sortDir, setSortDir] = useState('desc');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeModalConflict, setActiveModalConflict] = useState(null);

  const conflicts = useMemo(() => {
    const data = conflictsGeoJSON.features.map((f) => f.properties);
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [sortKey, sortDir]);

  const reviewRequiredConflicts = useMemo(() => {
    return conflicts.filter((c) => c.confidence_score < 78);
  }, [conflicts]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const handleOpenModal = (conflictObj = null) => {
    setActiveModalConflict(conflictObj);
    setModalOpen(true);
  };

  const SortIcon = ({ colKey }) => {
    if (sortKey !== colKey) return <ArrowUpDown size={12} className="text-slate-300 dark:text-slate-600" />;
    return sortDir === 'asc'
      ? <ArrowUp size={12} className="text-teal-500" />
      : <ArrowDown size={12} className="text-teal-500" />;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors shadow-sm">
      {/* Table Header */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
            🚨 Flagged Spatial Conflicts ({conflicts.length})
          </h3>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Threshold: 78% Confidence
          </span>
        </div>
        <span className="text-[10px] sm:hidden text-slate-400 dark:text-slate-500 font-medium">
          Swipe horizontally →
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              {[
                { key: 'plot_id', label: 'Plot ID' },
                { key: 'conflict_type', label: 'Conflict Type' },
                { key: 'iou', label: 'IoU %' },
                { key: 'confidence_score', label: 'Confidence' },
                { key: 'status', label: 'Status' },
              ].map((col) => (
                <th
                  key={col.key}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 select-none whitespace-nowrap"
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <SortIcon colKey={col.key} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {conflicts.map((c) => {
              const badge = getConfidenceBadge(c.confidence_score);
              const isSelected = c.plot_id === selectedPlotId;
              const isReviewRequired = c.confidence_score < 78;
              const isSevereUnder50 = c.confidence_score < 50;

              return (
                <tr
                  key={c.conflict_id}
                  onClick={() => onRowClick(c.plot_id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/60'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <td className="px-3 sm:px-4 py-2 sm:py-2.5 font-mono text-[11px] sm:text-xs font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {c.plot_id}
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-2.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {c.conflict_type}
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-2.5 font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {c.iou}%
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-2.5 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-medium ${badge.bg} ${badge.fg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {c.confidence_score}% — {badge.text}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-2.5 whitespace-nowrap">
                    {c.confidence_score < 78 ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(c);
                        }}
                        className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-semibold border transition-all duration-150 shadow-sm cursor-pointer ${
                          c.confidence_score < 50
                            ? 'bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/70 hover:border-red-400'
                            : 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/70 hover:border-amber-400'
                        }`}
                        title="Click to connect with the nearest jurisdictional land revenue verification office"
                      >
                        <span className="underline decoration-dotted underline-offset-2">
                          Recommended Human Review
                        </span>
                        <ExternalLink size={12} className="opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Confirmed
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Action Bar */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 font-bold text-[10px] shrink-0 border border-amber-300 dark:border-amber-700">
            {reviewRequiredConflicts.length}
          </span>
          <span className="leading-snug">
            Plots flagged for <strong>Recommended Human Review</strong> (&lt; 78% confidence)
          </span>
        </div>

        <button
          type="button"
          onClick={() => handleOpenModal(null)}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-700 dark:border-slate-600 shadow-sm transition-all duration-200 cursor-pointer w-full sm:w-auto hover:ring-2 hover:ring-teal-500/30"
        >
          <Building2 size={14} className="text-teal-400 shrink-0" />
          <span>Contact Jurisdictional Land Revenue Officer</span>
        </button>
      </div>

      {/* Jurisdictional Land Revenue Office Modal */}
      <RevenueOfficeModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setActiveModalConflict(null);
        }}
        conflict={activeModalConflict}
        allFlaggedConflicts={reviewRequiredConflicts}
      />
    </div>
  );
};

export default ConflictsTable;
