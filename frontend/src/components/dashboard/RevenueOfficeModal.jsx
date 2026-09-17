import React, { useState } from 'react';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Send,
  CheckCircle2,
  X,
  ExternalLink,
  AlertTriangle,
  FileText,
  UserCheck
} from 'lucide-react';
import { jurisdictionalRevenueOffice } from '../../data/mockData';

/**
 * RevenueOfficeModal
 * ------------------
 * Interactive simulation connecting flagged conflicts with the nearest
 * jurisdictional land revenue and ground-truth verification office.
 */
const RevenueOfficeModal = ({ isOpen, onClose, conflict, allFlaggedConflicts = [] }) => {
  const [dispatching, setDispatching] = useState(false);
  const [dispatched, setDispatched] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  if (!isOpen) return null;

  const office = jurisdictionalRevenueOffice;
  const isSpecificPlot = Boolean(conflict);

  const handleDispatch = () => {
    setDispatching(true);
    setTimeout(() => {
      setDispatching(false);
      setDispatched(true);
    }, 1200);
  };

  const handleCopy = (text, field) => {
    navigator.clipboard?.writeText?.(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const confidenceScore = conflict?.confidence_score ?? 0;
  const isUnder50 = confidenceScore < 50;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[88vh] transition-colors relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Header - shrink-0 ensures it never scrolls or gets crushed */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0">
              <Building2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Jurisdictional Land Revenue & Verification Office
                </h3>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/40 px-1.5 py-0.5 rounded font-mono">
                  LIVE DESK
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300">
                Department of Land Resources & Revenue Administration (DoLR)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 text-slate-700 dark:text-slate-200">
          
          {/* Case / Conflict Context Banner */}
          {isSpecificPlot ? (
            <div className={`p-3 sm:p-4 rounded-lg border ${
              isUnder50
                ? 'bg-red-50/70 dark:bg-red-950/40 border-red-200 dark:border-red-900/60'
                : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {conflict.plot_id}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {conflict.conflict_type}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      isUnder50
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300 border-red-300 dark:border-red-800'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                    }`}>
                      <AlertTriangle size={11} />
                      Recommended Human Review ({conflict.confidence_score}%)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                    Automated spatial confidence fell below the <strong>78% statutory threshold</strong>. As per DoLR protocol, this parcel requires on-site cadastral reconciliation and physical inspection by the local revenue inspector before title certification.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 sm:p-4 rounded-lg bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-teal-900 dark:text-teal-200">
                  <UserCheck size={16} className="text-teal-600 dark:text-teal-400" />
                  <span>Sub-Divisional Revenue Officer Verification Desk</span>
                </div>
                <span className="text-[11px] bg-teal-100 dark:bg-teal-900/70 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded font-semibold">
                  {allFlaggedConflicts.length} Plots Requiring Review
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Connect directly with the designated revenue division to schedule joint physical surveys, resolve boundary overlaps, and obtain verified demarcation certificates.
              </p>
            </div>
          )}

          {/* Office Directory Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/70 p-3.5 sm:p-4 space-y-3.5">
            <div className="flex items-start justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-3">
              <div>
                <p className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  Nearest Jurisdictional Authority
                </p>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {office.office_name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {office.division}
                </p>
              </div>
              <div className="hidden sm:block text-right">
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 block">
                  CADASTRAL CODE
                </span>
                <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  {office.cadastral_code}
                </span>
              </div>
            </div>

            {/* Officer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 uppercase font-medium flex items-center gap-1">
                  <ShieldCheck size={13} className="text-teal-500" /> Designated Nodal Officer
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {office.nodal_officer}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {office.designation}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 uppercase font-medium flex items-center gap-1">
                  <Clock size={13} className="text-slate-400" /> Operating Hours
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {office.office_hours}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  ● Office Open for Verification Inquiries
                </p>
              </div>
            </div>

            {/* Contact Channels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
              <button
                onClick={() => handleCopy(office.phone, 'phone')}
                className="flex items-center justify-between px-3 py-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs hover:border-teal-500 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-teal-600 dark:text-teal-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Official Landline</span>
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{office.phone}</span>
                  </div>
                </div>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                  {copiedField === 'phone' ? 'Copied!' : 'Copy'}
                </span>
              </button>

              <button
                onClick={() => handleCopy(office.email, 'email')}
                className="flex items-center justify-between px-3 py-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs hover:border-teal-500 transition-colors text-left"
              >
                <div className="flex items-center gap-2 truncate">
                  <Mail size={14} className="text-teal-600 dark:text-teal-400 shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 block font-medium">Official Dispatch Email</span>
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-200 truncate block">{office.email}</span>
                  </div>
                </div>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium shrink-0 ml-1">
                  {copiedField === 'email' ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>

            {/* Address */}
            <div className="flex items-start gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
              <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
              <span>{office.address}</span>
            </div>
          </div>

          {/* Dispatch Notice State */}
          {dispatched ? (
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold text-xs sm:text-sm">
                <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                <span>Field Verification Order Successfully Dispatched!</span>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Notice Ref: <strong className="font-mono">UP-REV-2026-{Math.floor(1000 + Math.random() * 9000)}</strong> has been formally queued to Nayab Tehsildar Shri R. K. Verma's field inspection schedule.
              </p>
              <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span>• Turnaround: 48-72 hours</span>
                <span>• Protocol: Physical Ground Truthing</span>
                <span>• Status: In Queue</span>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-3 sm:p-4 text-center space-y-2">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Ready to initiate formal field verification request for{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {isSpecificPlot ? conflict.plot_id : `${allFlaggedConflicts.length} Flagged Parcels`}
                </strong>
                ?
              </p>
              <button
                onClick={handleDispatch}
                disabled={dispatching}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs sm:text-sm shadow-md transition-all duration-200 disabled:opacity-75 cursor-pointer w-full sm:w-auto"
              >
                <Send size={15} className={dispatching ? 'animate-pulse' : ''} />
                <span>
                  {dispatching
                    ? 'Transmitting Official Notice…'
                    : 'Dispatch Field Ground-Truth Verification Notice'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Smart India Hackathon 2026 • PS26013 Mock Integration
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RevenueOfficeModal;
