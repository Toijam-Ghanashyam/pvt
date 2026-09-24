import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Building2,
  AlertTriangle,
  Target,
  Wrench,
  Scissors,
  Magnet,
  HeartPulse,
  CheckCircle2,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import AnimateOnScroll from '../../components/common/AnimateOnScroll';
import AnimatedCounter from '../../components/common/AnimatedCounter';

const AnalyticsPage = () => {
  const { language } = useDashboard();

  const [metrics, setMetrics] = useState({
    kpis: { totalAreaHectares: 0, totalBuildings: 0, encroachments: 0, accuracyRate: 0 },
    topology: { repaired: 0, snapped: 0, plotsCount: 0 },
    counts: { plots: 0, buildings: 0, conflicts: 0, municipal: 4, utilities: 5, gt: 10, gnss: 5 }
  });

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
    fetch(`${API_BASE}/topology-metrics`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.counts) {
          setMetrics(data);
        }
      })
      .catch((err) => console.error("Error fetching analytics:", err));
  }, []);

  const datasetStats = [
    { name: 'Cadastral Revenue Plots', nameHi: 'कडस्ट्रल भू-खण्ड (खसरा)', count: metrics.counts.plots, unit: 'Parcels', source: 'State Land Records (RoR)', status: 'Verified' },
    { name: 'AI Building Footprints', nameHi: 'एआई निर्मित भवन', count: metrics.counts.buildings, unit: 'Structures', source: 'High-Res Drone Orthomosaic', status: 'Synthesized' },
    { name: 'Spatial Overlap Conflicts', nameHi: 'स्थानिक अतिक्रमण / विवाद', count: metrics.counts.conflicts, unit: 'Encroachments', source: 'Spatial Conflict Engine', status: 'Action Required', alert: true },
    { name: 'Municipal Zoning Boundaries', nameHi: 'नगर निगम मास्टर प्लान', count: metrics.counts.municipal, unit: 'Zones', source: 'Lucknow Municipal Corp', status: 'Harmonized' },
    { name: 'Utility Networks (Water/Power)', nameHi: 'उपयोगिता नेटवर्क लाइनें', count: metrics.counts.utilities, unit: 'Pipelines', source: 'Dept. of Urban Utilities', status: 'Harmonized' },
    { name: 'Ground Truthing Checkpoints', nameHi: 'धरातलीय सत्यापन बिंदु', count: metrics.counts.gt, unit: 'Survey Points', source: 'Field Survey Team A/B/C', status: 'Calibrated' },
    { name: 'GNSS / CORS Base Stations', nameHi: 'जीएनएसएस कॉर्स स्टेशन', count: metrics.counts.gnss, unit: 'Stations', source: 'Survey of India Network', status: 'Continuous Active' },
  ];

  return (
    <div className="flex-1 w-full max-w-[1920px] mx-auto p-3 sm:p-6 space-y-6">
      <div className="bg-white dark:bg-[#0c1829] border border-slate-300 dark:border-slate-800 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-gov-navy dark:bg-amber-400 inline-block" />
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {language === 'hi' ? 'कार्यकारी सांख्यिकी एवं स्थानिक स्वास्थ्य' : 'Executive KPIs & Spatial Quality Analytics'}
            </h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Department of Land Resources (DoLR) Automated Multi-Source Spatial Integration Audit & Topology Quality Health
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-mono bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2.5 py-1 text-slate-700 dark:text-slate-300 font-semibold">
            AUDIT CYCLE: 2026-Q1 · VALIDATED
          </span>
        </div>
      </div>

      <section className="space-y-2">
        <div className="flex items-center justify-between border-b border-slate-300 dark:border-slate-800 pb-1">
          <h2 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span>📊 Section 1: Executive KPI Metrics</span>
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">Formula: PostGIS ST_Area & ST_Intersects</span>
        </div>

        <AnimateOnScroll className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" staggerChildren={0.08}>
          <div className="gov-box p-4 border-l-4 border-l-gov-navy dark:border-l-teal-500">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Integrated Area
              </span>
              <TrendingUp size={16} className="text-gov-navy dark:text-teal-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              <AnimatedCounter to={parseFloat(metrics.kpis.totalAreaHectares)} duration={1800} decimals={2} /> <span className="text-sm font-sans font-semibold text-slate-500">ha</span>
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {metrics.counts.plots} Cadastral parcels · 12,850 m²
            </p>
          </div>

          <div className="gov-box p-4 border-l-4 border-l-blue-600">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                AI Extracted Buildings
              </span>
              <Building2 size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              <AnimatedCounter to={metrics.kpis.totalBuildings} duration={1600} />
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Drone orthomosaic segmentation
            </p>
          </div>

          <div className="gov-box p-4 border-l-4 border-l-red-600 bg-red-50/30 dark:bg-red-950/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">
                Encroachments Flagged
              </span>
              <AlertTriangle size={16} className="text-red-600 dark:text-red-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-red-700 dark:text-red-400 font-mono">
              <AnimatedCounter to={metrics.kpis.encroachments} duration={1400} />
            </p>
            <span className="inline-block mt-1 text-[10px] font-bold text-red-800 dark:text-red-300 bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-800 px-1.5 py-0.2">
              ⚠ Requires Field Verification
            </span>
          </div>

          <div className="gov-box p-4 border-l-4 border-l-gov-green">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Spatial Accuracy Rate
              </span>
              <Target size={16} className="text-gov-green" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
              <AnimatedCounter to={parseFloat(metrics.kpis.accuracyRate)} duration={2000} decimals={1} suffix="%" />
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Calibrated against ground truth points
            </p>
          </div>
        </AnimateOnScroll>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between border-b border-slate-300 dark:border-slate-800 pb-1">
          <h2 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span>🛠️ Section 2: Automated Topology Diagnostics & Self-Correction</span>
          </h2>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 size={12} /> Auto-Correction Active
          </span>
        </div>

        <AnimateOnScroll className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" staggerChildren={0.08}>
          <div className="gov-box p-3 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2 mb-1">
              <Wrench size={14} className="text-slate-500" />
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                Plots Processed
              </span>
            </div>
            <p className="text-xl font-mono font-bold text-slate-800 dark:text-slate-100">{metrics.topology.plotsCount}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">100% Boundary Closure</p>
          </div>

          <div className="gov-box p-3 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2 mb-1">
              <Scissors size={14} className="text-slate-500" />
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                Slivers / Self-Intersects
              </span>
            </div>
            <p className="text-xl font-mono font-bold text-slate-800 dark:text-slate-100">{metrics.topology.repaired}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Repaired via ST_MakeValid</p>
          </div>

          <div className="gov-box p-3 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2 mb-1">
              <Magnet size={14} className="text-slate-500" />
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                Building Edges Snapped
              </span>
            </div>
            <p className="text-xl font-mono font-bold text-slate-800 dark:text-slate-100">{metrics.topology.snapped}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">5.0m snapping threshold</p>
          </div>

          <div className="gov-box p-3 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2 mb-1">
              <HeartPulse size={14} className="text-emerald-600" />
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                Spatial Health Score
              </span>
            </div>
            <p className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">99.8%</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">+1.2% post automated correction</p>
          </div>
        </AnimateOnScroll>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between border-b border-slate-300 dark:border-slate-800 pb-1">
          <h2 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            📁 Section 3: Harmonized Geospatial Datasets Register
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">Total Feeds: 7 Sources</span>
        </div>

        <div className="gov-box overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="gov-table-header">
                <th className="p-2.5 border-r border-slate-300 dark:border-slate-700">Dataset Name</th>
                <th className="p-2.5 border-r border-slate-300 dark:border-slate-700">Entity Count</th>
                <th className="p-2.5 border-r border-slate-300 dark:border-slate-700">Measurement Unit</th>
                <th className="p-2.5 border-r border-slate-300 dark:border-slate-700">Authoritative Source Agency</th>
                <th className="p-2.5">Harmonization Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {datasetStats.map((item) => (
                <tr key={item.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800">
                    <div>{item.name}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{item.nameHi}</div>
                  </td>
                  <td className="p-2.5 font-mono font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800">
                    {item.count}
                  </td>
                  <td className="p-2.5 text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                    {item.unit}
                  </td>
                  <td className="p-2.5 text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">
                    {item.source}
                  </td>
                  <td className="p-2.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg uppercase tracking-wider ${item.alert
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-2">
        <div className="border-b border-slate-300 dark:border-slate-800 pb-1">
          <h2 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            ⚖️ Section 4: Spatial Encroachment Confidence Threshold Calibration
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="gov-box p-3.5 border-t-4 border-t-red-600">
            <h3 className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1">
              High Risk (&lt; 50% Confidence)
            </h3>
            <p className="text-xl font-mono font-bold text-slate-800 dark:text-slate-100">1 Conflict (12.5%)</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Severe boundary contradiction with low model certainty. Urgent field survey required by Circle Amin.
            </p>
          </div>

          <div className="gov-box p-3.5 border-t-4 border-t-amber-500">
            <h3 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
              Human Review (50% – 78% Confidence)
            </h3>
            <p className="text-xl font-mono font-bold text-slate-800 dark:text-slate-100">4 Conflicts (50.0%)</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Discrepancy falls below 78% certainty threshold. Automatically referred to Nayab Tehsildar & LRO desk.
            </p>
          </div>

          <div className="gov-box p-3.5 border-t-4 border-t-emerald-600">
            <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
              Confirmed Overlap (&gt; 78% Confidence)
            </h3>
            <p className="text-xl font-mono font-bold text-slate-800 dark:text-slate-100">3 Conflicts (37.5%)</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              High geometric intersection overlap. Official inspection notices prepared for dispatch.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AnalyticsPage;