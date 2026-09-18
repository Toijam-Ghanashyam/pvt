import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  Building2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MapPin,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useDashboard } from '../../context/DashboardContext';
import AnimateOnScroll from '../../components/common/AnimateOnScroll';
import RevenueOfficeModal from '../../components/dashboard/RevenueOfficeModal';

const getConfidenceBadge = (score) => {
  if (score >= 78) {
    return {
      text: 'Confirmed Overlap',
      bg: 'bg-emerald-100 dark:bg-emerald-950/60',
      fg: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-300 dark:border-emerald-800',
    };
  }
  if (score >= 50) {
    return {
      text: 'Human Review Needed',
      bg: 'bg-amber-100 dark:bg-amber-950/60',
      fg: 'text-amber-800 dark:text-amber-300',
      border: 'border-amber-300 dark:border-amber-800',
    };
  }
  return {
    text: 'Severe Risk / Low Conf',
    bg: 'bg-red-100 dark:bg-red-950/60',
    fg: 'text-red-800 dark:text-red-300',
    border: 'border-red-300 dark:border-red-800',
  };
};

const ConflictsPage = () => {
  const navigate = useNavigate();
  const { setSelectedPlotId, language, geoData } = useDashboard();

  const [sortKey, setSortKey] = useState('confidence_score');
  const [sortDir, setSortDir] = useState('desc');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeModalConflict, setActiveModalConflict] = useState(null);

  const rawConflicts = useMemo(() => {
    return (geoData.conflicts?.features || []).map((f) => f.properties);
  }, [geoData.conflicts]);

  const filteredConflicts = useMemo(() => {
    let list = rawConflicts;
    if (activeFilter === 'SEVERE') {
      list = list.filter((c) => c.confidence_score < 50);
    } else if (activeFilter === 'REVIEW') {
      list = list.filter((c) => c.confidence_score >= 50 && c.confidence_score < 78);
    } else if (activeFilter === 'CONFIRMED') {
      list = list.filter((c) => c.confidence_score >= 78);
    }

    return [...list].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [rawConflicts, activeFilter, sortKey, sortDir]);

  const reviewRequiredConflicts = useMemo(() => {
    return rawConflicts.filter((c) => c.confidence_score < 78);
  }, [rawConflicts]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const handleInspectOnMap = (plotId) => {
    setSelectedPlotId(plotId);
    navigate('/dashboard');
  };

  const handleOpenModal = (conflictObj = null) => {
    setActiveModalConflict(conflictObj);
    setModalOpen(true);
  };

  const SortIcon = ({ colKey }) => {
    if (sortKey !== colKey) return <ArrowUpDown size={12} className="text-slate-400" />;
    return sortDir === 'asc'
      ? <ArrowUp size={12} className="text-gov-navy dark:text-amber-400" />
      : <ArrowDown size={12} className="text-gov-navy dark:text-amber-400" />;
  };

  return (
    <div className="flex-1 w-full max-w-[1920px] mx-auto p-3 sm:p-6 space-y-5">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0c1829] border border-slate-300 dark:border-slate-800 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-600 inline-block" />
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {language === 'hi' ? 'स्थानिक अतिक्रमण एवं विवाद समाधान केंद्र' : 'Spatial Encroachment & Conflict Resolution Center'}
            </h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Official Automated Cadastral Overlap Detection & Jurisdictional Land Revenue Escalation Console
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal(null)}
            className="gov-btn bg-gov-navy hover:bg-[#183a69] text-white border-gov-navy-dark shadow-xs"
            title="Dispatch to Jurisdictional Tehsildar"
          >
            <Building2 size={14} className="text-amber-400" />
            <span>Contact Nayab Tehsildar</span>
          </button>
        </div>
      </div>

      {/* Threshold Information Alert */}
      <AnimateOnScroll>
        <div className="bg-amber-50/80 dark:bg-amber-950/30 border-l-4 border-l-amber-500 border border-amber-200/60 dark:border-amber-800/50 p-3 sm:p-4 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg shadow-sm">
          <div className="flex items-start gap-2.5">
            <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold uppercase tracking-wider text-[11px]">
                Statutory 78% Confidence Review Threshold Active (DoLR Standard PS26013)
              </p>
              <p className="text-amber-800 dark:text-amber-300/80 mt-1 leading-relaxed">
                Plots with AI extraction confidence below 78% cannot be finalized automatically without manual physical verification by the Jurisdictional Revenue Inspector (RI) and Nayab Tehsildar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono font-bold bg-white dark:bg-amber-900/60 px-2.5 py-1.5 border border-amber-300 dark:border-amber-700/60 rounded-lg shadow-sm">
              {reviewRequiredConflicts.length} Flagged for Review
            </span>
          </div>
        </div>
      </AnimateOnScroll>

      {/* Filter Tabs */}
      <div className="gov-box p-2.5 flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center gap-1">
          {[
            { id: 'ALL', label: `All Flagged (${rawConflicts.length})` },
            { id: 'SEVERE', label: 'Severe Risk (< 50%)' },
            { id: 'REVIEW', label: 'Human Review (50%–78%)' },
            { id: 'CONFIRMED', label: 'Confirmed (> 78%)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                activeFilter === tab.id
                  ? 'bg-gov-navy text-white border-gov-navy shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-[11px] text-slate-500 font-mono">
          Sorted by: {sortKey.toUpperCase()} ({sortDir.toUpperCase()})
        </span>
      </div>

      {/* Conflicts Table */}
      <div className="gov-box overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="gov-table-header">
              {[
                { key: 'plot_id', label: 'Plot / Khasra ID' },
                { key: 'conflict_type', label: 'Conflict Type' },
                { key: 'iou', label: 'IoU % Overlap' },
                { key: 'confidence_score', label: 'AI Confidence Score' },
                { key: 'status', label: 'Adjudication Status' },
              ].map((col) => (
                <th
                  key={col.key}
                  className="p-2.5 border-r border-slate-300 dark:border-slate-700 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 select-none"
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    <SortIcon colKey={col.key} />
                  </div>
                </th>
              ))}
              <th className="p-2.5 text-center">Actions & Escalation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredConflicts.map((c) => {
              const badge = getConfidenceBadge(c.confidence_score);
              const isReviewRequired = c.confidence_score < 78;

              return (
                <motion.tr 
                  key={c.conflict_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * (filteredConflicts.indexOf(c) % 15) }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  {/* Plot ID */}
                  <td className="p-2.5 font-mono font-bold text-blue-700 dark:text-blue-400 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                    {c.plot_id}
                  </td>

                  {/* Conflict Type */}
                  <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                    {c.conflict_type}
                  </td>

                  {/* IoU % Overlap */}
                  <td className="p-2.5 font-mono font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                    {c.iou}%
                  </td>

                  {/* Confidence Score */}
                  <td className="p-2.5 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg uppercase tracking-wider border ${badge.bg} ${badge.fg} ${badge.border}`}>
                      {c.confidence_score}% — {badge.text}
                    </span>
                  </td>

                  {/* Adjudication Status */}
                  <td className="p-2.5 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                    {isReviewRequired ? (
                      <button
                        type="button"
                        onClick={() => handleOpenModal(c)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 transition-colors"
                        title="Click to connect with Nayab Tehsildar & Nodal LRO"
                      >
                        <span className="underline decoration-dotted underline-offset-2">
                          Recommended Human Review
                        </span>
                        <ExternalLink size={11} className="shrink-0" />
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg uppercase tracking-wider border bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300">
                        <CheckCircle2 size={11} />
                        Automated Encroachment Confirmed
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-2.5 text-center whitespace-nowrap space-x-1.5">
                    <button
                      onClick={() => handleInspectOnMap(c.plot_id)}
                      className="gov-btn bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800 hover:bg-blue-100 hover:shadow-sm hover:-translate-y-0.5 transition-all"
                      title="Inspect parcel overlay on Interactive Map"
                    >
                      <MapPin size={12} />
                      <span>Locate on Map</span>
                    </button>

                    {isReviewRequired && (
                      <button
                        onClick={() => handleOpenModal(c)}
                        className="gov-btn bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200 hover:shadow-sm hover:-translate-y-0.5 transition-all"
                        title="Dispatch case file to Tehsil Sadar Revenue Office"
                      >
                        <Building2 size={12} />
                        <span>Escalate</span>
                      </button>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Nayab Tehsildar Jurisdictional Land Revenue Modal */}
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

export default ConflictsPage;
