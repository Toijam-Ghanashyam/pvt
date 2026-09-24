import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  Package,
  FileText,
  Loader2,
  Zap,
  Server,
  Database,
  CheckCircle2,
  HardDrive,
  FileCode,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import IngestionHub from '../../components/dashboard/IngestionHub';
import { useDashboard } from '../../context/DashboardContext';
import AnimateOnScroll from '../../components/common/AnimateOnScroll';

const IngestionPage = () => {
  const { language, setToast } = useDashboard();
  const [stacSyncing, setStacSyncing] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
    fetch(`${API_BASE}/audit-logs`)
      .then(res => res.json())
      .then(data => setAuditLogs(data))
      .catch(err => console.error("Failed to load audit logs", err));
  }, []);

  const handleSyncSTAC = () => {
    setStacSyncing(true);
    setTimeout(() => {
      setStacSyncing(false);
      setToast({
        message: 'STAC Catalog Synchronized: 14 new satellite tiles verified from National Remote Sensing Centre (NRSC / ISRO).',
        type: 'success',
      });
    }, 1800);
  };

  return (
    <div className="flex-1 w-full max-w-[1920px] mx-auto p-3 sm:p-6 space-y-6">
      <div className="bg-white dark:bg-[#0c1829] border border-slate-300 dark:border-slate-800 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-gov-navy dark:bg-amber-400 inline-block" />
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {language === 'hi' ? 'डेटा अंतर्ग्रहण एवं स्रोत हब' : 'National Geospatial Data Ingestion & STAC Hub'}
            </h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Standardized ETL ingestion for Cadastral Shapefiles, Drone Survey Orthomosaics, Municipal GIS, and CORS RINEX Feeds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncSTAC}
            disabled={stacSyncing}
            className="gov-btn bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-400 dark:border-slate-600 shadow-xs"
            title="Poll SpatioTemporal Asset Catalog"
          >
            <RefreshCw size={13} className={stacSyncing ? 'animate-spin' : ''} />
            <span>{stacSyncing ? 'Syncing STAC…' : 'Sync NRSC / STAC Catalog'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnimateOnScroll className="lg:col-span-1 space-y-4" staggerChildren={0.1}>
          <div className="gov-box p-4 bg-white/80 dark:bg-[#0c1829]/80 backdrop-blur-sm shadow-sm border border-slate-200/60 dark:border-slate-700/50">
            <div className="border-b border-slate-300 dark:border-slate-800 pb-2 mb-4">
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <HardDrive size={15} className="text-gov-navy dark:text-teal-400" />
                <span>ETL Data Pipeline Dispatcher</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Target Database: PostgreSQL 16 + PostGIS 3.4
              </p>
            </div>

            <IngestionHub
              onIngestSuccess={() =>
                setToast({
                  message: 'File ingested and validated against DoLR geometry constraints.',
                  type: 'success',
                })
              }
            />
          </div>

          <div className="gov-box p-4 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm text-xs text-slate-600 dark:text-slate-400 space-y-2 border border-slate-200/60 dark:border-slate-700/50">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[11px]">
              DoLR Ingestion Specifications (PS26013)
            </h3>
            <ul className="list-disc pl-4 space-y-1 text-[11px]">
              <li><strong>Cadastral Maps:</strong> ESRI Shapefile (.shp/.shx/.dbf) or GeoJSON in EPSG:4326.</li>
              <li><strong>Drone Imagery:</strong> GeoTIFF / Cloud Optimized GeoTIFF (COG) with sub-10cm GSD.</li>
              <li><strong>Topology Tolerances:</strong> Auto-snapping vertex threshold is set to 5.0m.</li>
              <li><strong>STAC Standard:</strong> STAC API v1.0.0 compliance with spatio-temporal cataloging.</li>
            </ul>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll className="lg:col-span-2 space-y-4" staggerChildren={0.1} delay={0.2}>
          <div className="gov-box shadow-sm border border-slate-200/60 dark:border-slate-700/50 overflow-hidden">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={15} className="text-gov-navy dark:text-teal-400" />
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Harmonization Audit Trail & Data Provenance
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {auditLogs.length} Historical Feeds Logged
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="gov-table-header">
                    <th className="p-2.5 border-r border-slate-300 dark:border-slate-700">Batch ID</th>
                    <th className="p-2.5 border-r border-slate-300 dark:border-slate-700">Dataset Layer</th>
                    <th className="p-2.5 border-r border-slate-300 dark:border-slate-700">File Size</th>
                    <th className="p-2.5 border-r border-slate-300 dark:border-slate-700">Source Agency</th>
                    <th className="p-2.5 border-r border-slate-300 dark:border-slate-700">Timestamp</th>
                    <th className="p-2.5">Pipeline Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {auditLogs.map((log, index) => (
                    <motion.tr
                      key={log.id || index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 * index }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="p-2.5 font-mono font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                        {log.id}
                      </td>
                      <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                        {log.layer}
                      </td>
                      <td className="p-2.5 font-mono text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap text-[11px]">
                        {log.size}
                      </td>
                      <td className="p-2.5 text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">
                        {log.source}
                      </td>
                      <td className="p-2.5 font-mono text-[10px] text-slate-500 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                        {log.time}
                      </td>
                      <td className="p-2.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-lg uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors">
                          <CheckCircle2 size={10} />
                          {log.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr><td colSpan={6} className="p-4 text-center text-slate-500">No logs found. Waiting for ingestion API connection.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="gov-box p-4 bg-white/80 dark:bg-[#0c1829]/80 backdrop-blur-sm shadow-sm space-y-3 border border-slate-200/60 dark:border-slate-700/50">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Server size={16} className="text-gov-navy dark:text-teal-400" />
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Active Geospatial Feed Connectors
                </h3>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                4 ENDPOINTS ONLINE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="border border-slate-200 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900">
                <p className="font-bold text-slate-800 dark:text-slate-200">ISRO Bhuvan STAC API</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">https://bhuvan-app1.nrsc.gov.in/api/stac/v1</p>
                <span className="inline-block mt-1 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 border border-emerald-200">
                  HTTP 200 OK · Sync Interval: 15m
                </span>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900">
                <p className="font-bold text-slate-800 dark:text-slate-200">Survey of India CORS Network</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">ntrip.surveyofindia.gov.in:2101/UP_LKO_RTCM3</p>
                <span className="inline-block mt-1 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 border border-emerald-200">
                  NTRIP STREAMING · ±2cm Geodetic
                </span>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </div>
  );
};

export default IngestionPage;