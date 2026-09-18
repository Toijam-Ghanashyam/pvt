import React, { useState, useCallback } from 'react';
import { Upload, Package, FileText, Loader2, Zap } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import Toast from './Toast';

/**
 * IngestionHub — Data upload section placed inside the LayerSidebar.
 * Mirrors app.py lines 175-208: batch (.zip) and individual file upload.
 *
 * Props:
 *  - onIngestSuccess: callback when data is successfully ingested
 */

const LAYER_TYPES = [
  { label: 'Vector Parcel Map (.geojson / .shp)', accept: '.geojson,.shp' },
  { label: 'AI Building Footprints (.geojson)', accept: '.geojson' },
  { label: 'Revenue Tax Records (.csv)', accept: '.csv' },
  { label: 'Municipal Zoning Layer (.geojson / .csv)', accept: '.geojson,.csv' },
  { label: 'Utility Network Layer (.geojson / .csv)', accept: '.geojson,.csv' },
  { label: 'Ground Truthing Survey (.geojson / .csv)', accept: '.geojson,.csv' },
  { label: 'GNSS / CORS Stations (.geojson / .csv)', accept: '.geojson,.csv' },
  { label: 'Drone Aerial Image (.tif)', accept: '.tif,.tiff' },
];

const IngestionHub = ({ onIngestSuccess }) => {
  const [mode, setMode] = useState('batch'); // 'batch' | 'individual'
  const [selectedLayer, setSelectedLayer] = useState(LAYER_TYPES[0].label);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [engineLoading, setEngineLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const acceptedTypes = mode === 'batch'
    ? '.zip'
    : LAYER_TYPES.find((l) => l.label === selectedLayer)?.accept || '*';

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleIngest = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('layer_type', mode === 'batch' ? 'Batch' : selectedLayer);
      formData.append('file', file);
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || 'Upload failed');

      setToast({ message: result.summary, type: 'success' });
      setFile(null);
      onIngestSuccess?.();
    } catch (err) {
      setToast({ message: `Ingestion failed: ${err}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [file, mode, selectedLayer, onIngestSuccess]);

  const handleRunEngine = useCallback(async () => {
    setEngineLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/run-conflict-engine`, { method: 'POST' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || 'Engine failed');
      
      setToast({ message: result.message, type: 'success' });
    } catch (err) {
      setToast({ message: 'Engine failed unexpectedly.', type: 'error' });
    } finally {
      setEngineLoading(false);
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Upload size={12} />
          Data Ingestion Hub
        </h3>
        <p className="text-[11px] text-slate-400 mt-1">
          Upload land files to integrate into the platform
        </p>
      </div>

      {/* Mode toggle (segmented control) */}
      <div className="flex rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
        <button
          onClick={() => { setMode('batch'); setFile(null); }}
          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-medium transition-colors ${
            mode === 'batch'
              ? 'bg-navy-800 dark:bg-teal-600 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <Package size={12} />
          Batch (.zip)
        </button>
        <button
          onClick={() => { setMode('individual'); setFile(null); }}
          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-medium transition-colors ${
            mode === 'individual'
              ? 'bg-navy-800 dark:bg-teal-600 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <FileText size={12} />
          Individual
        </button>
      </div>

      {/* Batch mode helper text */}
      {mode === 'batch' && (
        <p className="text-[10px] text-slate-400 leading-tight">
          Archive containing multiple layers — the system auto-detects cadastral parcels, buildings, revenue records, municipal zones, utilities, ground truthing, and GNSS files by filename pattern.
        </p>
      )}

      {/* Individual mode: layer type dropdown */}
      {mode === 'individual' && (
        <select
          value={selectedLayer}
          onChange={(e) => { setSelectedLayer(e.target.value); setFile(null); }}
          className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-md px-2 py-2 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
        >
          {LAYER_TYPES.map((lt) => (
            <option key={lt.label} value={lt.label}>{lt.label}</option>
          ))}
        </select>
      )}

      {/* File upload */}
      <div className="relative group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
        <div className="absolute inset-0 bg-teal-50 dark:bg-teal-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <input
          type="file"
          accept={acceptedTypes}
          onChange={handleFileChange}
          className="relative z-10 w-full text-xs border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/40 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-teal-600 file:text-white file:cursor-pointer hover:border-teal-400 dark:hover:border-teal-500 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-teal-500/20"
        />
      </div>

      {/* File name display */}
      {file && (
        <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium truncate">
          📁 {file.name}
        </p>
      )}

      {/* Process & Ingest button */}
      <button
        onClick={handleIngest}
        disabled={!file || loading}
        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-navy-900 font-semibold text-xs px-3 py-2.5 rounded-md shadow-sm transition-all"
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Ingesting data and running spatial analysis...
          </>
        ) : (
          <>
            <Upload size={14} />
            Process & Ingest File
          </>
        )}
      </button>

      {/* Divider */}
      <hr className="border-slate-200 dark:border-slate-800" />

      {/* Run Spatial Conflict Engine (standalone) */}
      <button
        onClick={handleRunEngine}
        disabled={engineLoading}
        className="w-full flex items-center justify-center gap-2 bg-navy-800 hover:bg-navy-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border dark:border-slate-700 disabled:bg-navy-800/60 dark:disabled:bg-slate-800/60 disabled:cursor-not-allowed text-white font-semibold text-xs px-3 py-2.5 rounded-md shadow-sm transition-all"
      >
        {engineLoading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            <span className="text-[10px] leading-tight">Executing topology repair, vertex snapping, and encroachment detection...</span>
          </>
        ) : (
          <>
            <Zap size={14} />
            Run Spatial Conflict Engine
          </>
        )}
      </button>

      {/* Toast notification */}
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

export default IngestionHub;
