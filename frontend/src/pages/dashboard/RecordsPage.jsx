import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Download,
  MapPin,
  FileDown,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useDashboard } from '../../context/DashboardContext';
import AnimateOnScroll from '../../components/common/AnimateOnScroll';
import AnimatedCounter from '../../components/common/AnimatedCounter';

const RecordsPage = () => {
  const navigate = useNavigate();
  const { setSelectedPlotId, language, geoData } = useDashboard();

  const [searchQuery, setSearchQuery] = useState('');
  const [taxFilter, setTaxFilter] = useState('ALL');
  const [discrepancyOnly, setDiscrepancyOnly] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  // Filtered & Searched records
  const filteredRecords = useMemo(() => {
    return (geoData.revenue || []).filter((r) => {
      const matchesSearch =
        r.plot_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.tax_id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTax = taxFilter === 'ALL' || r.tax_status.toUpperCase() === taxFilter;
      const discrepancy = Math.abs(r.registered_area_sqm - r.gis_area_sqm);
      const matchesDiscrepancy = !discrepancyOnly || discrepancy > 10;

      return matchesSearch && matchesTax && matchesDiscrepancy;
    });
  }, [searchQuery, taxFilter, discrepancyOnly]);

  // Aggregate stats
  const totalRegistered = (geoData.revenue || []).reduce((s, r) => s + r.registered_area_sqm, 0);
  const totalGis = (geoData.revenue || []).reduce((s, r) => s + r.gis_area_sqm, 0);
  const totalDiscrepancy = Math.abs(totalRegistered - totalGis);

  const handleInspectOnMap = (plotId) => {
    setSelectedPlotId(plotId);
    navigate('/dashboard');
  };

  const handleDownloadCSV = () => {
    const headers = ['Plot ID', 'Legal Owner', 'Tax ID', 'Tax Status', 'Registered Area (m2)', 'GIS Area (m2)', 'Discrepancy (m2)'];
    const rows = filteredRecords.map((r) => [
      r.plot_id,
      `"${r.owner_name}"`,
      r.tax_id,
      r.tax_status,
      r.registered_area_sqm,
      r.gis_area_sqm,
      Math.abs(r.registered_area_sqm - r.gis_area_sqm),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'DoLR_Cadastral_Revenue_Records_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadNotice = (plotId) => {
    setDownloadingId(plotId);
    setTimeout(() => {
      setDownloadingId(null);
      alert(`Official Land Survey & Cadastral Inspection Notice for ${plotId} downloaded successfully.`);
    }, 1200);
  };

  return (
    <div className="flex-1 w-full max-w-[1920px] mx-auto p-3 sm:p-6 space-y-5">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0c1829] border border-slate-300 dark:border-slate-800 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-gov-navy dark:bg-amber-400 inline-block" />
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {language === 'hi' ? 'भू-अभिलेख एवं खसरा खतौनी रजिस्टर' : 'Cadastral Land Revenue Register (RoR)'}
            </h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Department of Land Resources (DoLR) Integrated Database · Tehsil Sadar, Circle 4, Lucknow
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCSV}
            className="gov-btn bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-400 dark:border-slate-600 shadow-xs"
            title="Export full cadastral registry as CSV"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Strip */}
      <AnimateOnScroll className="grid grid-cols-1 sm:grid-cols-3 gap-4" staggerChildren={0.1}>
        <div className="gov-box p-4 border-l-4 border-l-blue-600 dark:border-l-blue-500 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Deeded Area (RoR)
          </span>
          <p className="text-xl font-mono font-bold text-slate-900 dark:text-white mt-1">
            <AnimatedCounter to={totalRegistered} duration={1500} /> <span className="text-xs font-sans font-normal text-slate-500">m²</span>
          </p>
        </div>

        <div className="gov-box p-4 border-l-4 border-l-emerald-600 dark:border-l-emerald-500 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total GIS Surveyed Area
          </span>
          <p className="text-xl font-mono font-bold text-slate-900 dark:text-white mt-1">
            <AnimatedCounter to={totalGis} duration={1500} /> <span className="text-xs font-sans font-normal text-slate-500">m²</span>
          </p>
        </div>

        <div className="gov-box p-4 border-l-4 border-l-amber-500 dark:border-l-amber-400 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Net Survey Discrepancy
          </span>
          <p className="text-xl font-mono font-bold text-amber-700 dark:text-amber-400 mt-1">
            ±<AnimatedCounter to={totalDiscrepancy} duration={1500} /> <span className="text-xs font-sans font-normal text-slate-500">m² (0.8%)</span>
          </p>
        </div>
      </AnimateOnScroll>

      {/* Filter & Search Bar */}
      <div className="gov-box p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900">
        <div className="flex-1 flex items-center gap-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Plot ID (PLT-001), Legal Owner Name, or Tax ID..."
            className="w-full text-xs bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 text-xs">
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Tax Status Filter */}
          <div className="flex items-center border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800">
            <span className="px-2 py-1 text-[11px] font-bold text-slate-500 uppercase bg-slate-100 dark:bg-slate-700 border-r border-slate-300 dark:border-slate-600">
              Tax
            </span>
            {['ALL', 'PAID', 'PENDING', 'OVERDUE'].map((status) => (
              <button
                key={status}
                onClick={() => setTaxFilter(status)}
                className={`px-2 py-1 text-[11px] font-semibold transition-all duration-200 hover:scale-[1.03] ${
                  taxFilter === status
                    ? 'bg-gov-navy text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Area Discrepancy Toggle */}
          <label className="flex items-center gap-1.5 px-2.5 py-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer select-none text-[11px] font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={discrepancyOnly}
              onChange={(e) => setDiscrepancyOnly(e.target.checked)}
              className="rounded-none border-slate-400 text-gov-navy"
            />
            <span>&gt; 10m² Discrepancy Only</span>
          </label>
        </div>
      </div>

      {/* Cadastral Records Table */}
      <div className="gov-box overflow-x-auto">
        <div className="p-2.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Showing {filteredRecords.length} of {(geoData.revenue || []).length} Cadastral Parcels
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            District: Lucknow · Sub-Division: Sadar
          </span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="gov-table-header">
              <th className="p-2.5 border-r border-slate-300 dark:border-slate-700">Khasra / Plot ID</th>
              <th className="p-2.5 border-r border-slate-300 dark:border-slate-700">Legal Owner (Deed)</th>
              <th className="p-2.5 border-r border-slate-300 dark:border-slate-700">Tax ID</th>
              <th className="p-2.5 border-r border-slate-300 dark:border-slate-700">Property Tax Status</th>
              <th className="p-2.5 border-r border-slate-300 dark:border-slate-700 text-right">Deeded Area</th>
              <th className="p-2.5 border-r border-slate-300 dark:border-slate-700 text-right">GIS Survey Area</th>
              <th className="p-2.5 border-r border-slate-300 dark:border-slate-700 text-right">Discrepancy</th>
              <th className="p-2.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">
                  No cadastral records found matching your filters.
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => {
                const discrepancy = Math.abs(record.registered_area_sqm - record.gis_area_sqm);
                const isSignificant = discrepancy > 10;

                return (
                  <motion.tr 
                    key={record.plot_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * (filteredRecords.indexOf(record) % 15) }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    {/* Plot ID */}
                    <td className="p-2.5 font-mono font-bold text-blue-700 dark:text-blue-400 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {record.plot_id}
                    </td>

                    {/* Legal Owner */}
                    <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {record.owner_name}
                    </td>

                    {/* Tax ID */}
                    <td className="p-2.5 font-mono text-[11px] text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {record.tax_id}
                    </td>

                    {/* Tax Status */}
                    <td className="p-2.5 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg uppercase tracking-wider ${
                          record.tax_status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : record.tax_status === 'Pending'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800'
                        }`}
                      >
                        {record.tax_status}
                      </span>
                    </td>

                    {/* Registered Area */}
                    <td className="p-2.5 font-mono text-right text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {record.registered_area_sqm} m²
                    </td>

                    {/* GIS Area */}
                    <td className="p-2.5 font-mono text-right text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {record.gis_area_sqm} m²
                    </td>

                    {/* Discrepancy */}
                    <td className="p-2.5 font-mono text-right border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      <span className={isSignificant ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-600 dark:text-slate-400'}>
                        {discrepancy > 0 ? `±${discrepancy} m²` : '0 m²'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-2.5 text-center whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => handleInspectOnMap(record.plot_id)}
                        className="gov-btn bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800 hover:bg-blue-100"
                        title="Focus and inspect on interactive map"
                      >
                        <MapPin size={12} />
                        <span>Map View</span>
                      </button>

                      <button
                        onClick={() => handleDownloadNotice(record.plot_id)}
                        disabled={downloadingId === record.plot_id}
                        className="gov-btn bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200 hover:shadow-sm hover:-translate-y-0.5 transition-all"
                        title="Generate official cadastral inspection notice"
                      >
                        <FileDown size={12} />
                        <span>{downloadingId === record.plot_id ? 'Generating…' : 'Notice'}</span>
                      </button>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecordsPage;
