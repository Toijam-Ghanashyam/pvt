import React, { useState } from 'react';
import { FileDown, User, Receipt, Hash, Ruler, AlertCircle, Brain } from 'lucide-react';
import { revenueRecords, conflictsGeoJSON } from '../../data/mockData';

/**
 * PlotInspectionPanel — Appears when a cadastral plot is clicked.
 * Mirrors the plot inspection section in app.py:
 *  - Owner, Tax Status, Tax ID
 *  - Registered vs. GIS Area vs. Discrepancy
 *  - AI Model Diagnostics (confidence + IoU progress bars)
 *  - Download PDF button (stubbed)
 */

const ConfidenceBar = ({ label, value, threshold = 78 }) => {
  const isHigh = value >= threshold;
  const isMedium = value >= 50 && value < threshold;

  const barColor = isHigh
    ? 'bg-emerald-500'
    : isMedium
      ? 'bg-amber-500'
      : 'bg-red-500';

  const badgeColor = isHigh
    ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60'
    : isMedium
      ? 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60'
      : 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60';

  const badgeText = isHigh ? 'High Certainty' : 'Recommended Human Review';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${badgeColor}`}>
          {badgeText}
        </span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{value.toFixed(1)}%</span>
    </div>
  );
};

const PlotInspectionPanel = ({ selectedPlotId }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownloadNotice = async () => {
    setDownloading(true);
    try {
      // 1. Build Query Parameters for the PDF Engine
      const queryParams = new URLSearchParams({
        owner_name: record.owner_name,
        tax_id: record.tax_id,
        reg_area: record.registered_area_sqm,
        gis_area: record.gis_area_sqm,
        discrepancy: discrepancy,
        iou: conflict ? conflict.properties.iou : 0,
        confidence: conflict ? conflict.properties.confidence_score : 0,
        conflict_type: conflict ? conflict.properties.conflict_type : 'N/A'
      });

      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
      const url = `${API_BASE}/reports/encroachment/${selectedPlotId}?${queryParams}`;

      // 2. Fetch PDF Blob from FastAPI
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();

      // 3. Trigger Browser Download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Encroachment_Notice_Plot_${selectedPlotId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (error) {
      console.error("PDF Download Error:", error);
      alert("Failed to connect to NAKSHA API to generate PDF.");
    } finally {
      setDownloading(false);
    }
  };

  /* Empty state */
  if (!selectedPlotId) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 text-center transition-colors">
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No parcel selected</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Click any cadastral plot on the map or a row in the conflicts table to inspect attributes.
        </p>
      </div>
    );
  }

  /* Find revenue record for the selected plot */
  const record = revenueRecords.find((r) => r.plot_id === selectedPlotId);

  /* Find linked conflict (if any) */
  const conflict = conflictsGeoJSON.features.find(
    (f) => f.properties.plot_id === selectedPlotId
  );

  if (!record) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 text-center transition-colors">
        <p className="text-sm text-slate-400 dark:text-slate-500">No revenue record found for {selectedPlotId}.</p>
      </div>
    );
  }

  const discrepancy = Math.abs(record.registered_area_sqm - record.gis_area_sqm);
  const isLargeDiscrepancy = discrepancy > 10;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      {/* Header */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
          📋 Plot Inspection — {selectedPlotId}
        </h3>
        <button
          onClick={handleDownloadNotice}
          disabled={downloading}
          className="flex items-center justify-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/60 disabled:opacity-75 px-3 py-1.5 rounded-md transition-colors w-full sm:w-auto"
        >
          <FileDown size={14} className={downloading ? 'animate-bounce shrink-0' : 'shrink-0'} />
          <span>
            {downloading
              ? 'Generating Notice…'
              : downloaded
                ? 'Notice Ready (Simulated)'
                : <>Download <span className="hidden sm:inline">Official Inspection </span>Notice (PDF)</>}
          </span>
        </button>
      </div>

      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Row 1: Owner, Tax Status, Tax ID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <StatCell icon={User} label="Legal Owner" value={record.owner_name} />
          <StatCell
            icon={Receipt}
            label="Property Tax Status"
            value={record.tax_status}
            valueClass={
              record.tax_status === 'Overdue'
                ? 'text-red-600 dark:text-red-400'
                : record.tax_status === 'Pending'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
            }
          />
          <StatCell icon={Hash} label="Tax ID" value={record.tax_id} />
        </div>

        {/* Row 2: Registered Area, GIS Area, Discrepancy */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <StatCell icon={Ruler} label="Registered Area" value={`${record.registered_area_sqm} m²`} />
          <StatCell icon={Ruler} label="GIS Surveyed Area" value={`${record.gis_area_sqm} m²`} />
          <StatCell
            icon={AlertCircle}
            label="Area Discrepancy"
            value={`${discrepancy} m²`}
            valueClass={isLargeDiscrepancy ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-700 dark:text-slate-200'}
          />
        </div>

        {/* AI Model Diagnostics (only if conflict exists) */}
        {conflict && (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-800 p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Brain size={16} className="text-teal-600 dark:text-teal-400" />
              <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                AI Model Diagnostics
              </h4>
            </div>
            <ConfidenceBar
              label="AI Extraction Confidence"
              value={conflict.properties.confidence_score}
            />
            <ConfidenceBar
              label="Spatial Overlap / IoU"
              value={conflict.properties.iou}
            />
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Small stat cell helper ────────────────────────────────────────── */
const StatCell = ({ icon: Icon, label, value, valueClass = 'text-slate-700 dark:text-slate-200' }) => (
  <div className="bg-slate-50 dark:bg-slate-800/70 rounded-md border border-slate-100 dark:border-slate-700/60 p-3 transition-colors">
    <div className="flex items-center gap-1.5 mb-1">
      <Icon size={12} className="text-slate-400 dark:text-slate-500" />
      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
    <p className={`text-sm font-semibold ${valueClass} truncate`}>{value}</p>
  </div>
);

export default PlotInspectionPanel;
