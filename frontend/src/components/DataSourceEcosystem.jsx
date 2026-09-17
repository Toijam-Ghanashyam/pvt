import React from 'react';
import { ShieldCheck, Satellite, Camera, Mountain, Compass, Landmark, FileText, Map, Zap, Building2 } from 'lucide-react';
import AnimateOnScroll from './common/AnimateOnScroll';
import { motion } from 'framer-motion';

const DataSourceEcosystem = () => {
  const nakhaSources = [
    { name: "Drone Imagery", icon: Camera },
    { name: "Orthorectified Imagery (ORI)", icon: Satellite },
    { name: "DSM/DTM Datasets", icon: Mountain },
    { name: "Ground Truthing (GT)", icon: Compass },
    { name: "GNSS/CORS Survey Data", icon: Satellite },
  ];

  const legacySources = [
    { name: "Existing Cadastral Maps", icon: Map },
    { name: "Revenue Records", icon: FileText },
    { name: "Municipal GIS Layers", icon: Landmark },
    { name: "Utility Network Data", icon: Zap },
    { name: "Building Footprints", icon: Building2 },
  ];

  return (
    <section id="data-sources" className="section-spacing bg-slate-50 dark:bg-slate-950 border-t border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center max-w-3xl mx-auto mb-14 lg:mb-16">
          <h2 className="section-title">Multi-Source Data Ecosystem</h2>
          <p className="section-subtitle">
            A centralized integration engine built to automatically ingest and harmonize diverse geospatial inputs.
          </p>
        </AnimateOnScroll>

        <div className="relative">
          {/* Central AI Engine Hub — Desktop */}
          <AnimateOnScroll
            direction="none"
            className="hidden lg:flex absolute inset-0 items-center justify-center pointer-events-none z-10"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
              className="bg-navy-900 dark:bg-slate-900 text-white p-6 rounded-2xl shadow-2xl border-2 border-teal-500/60 w-64 text-center animate-pulse-glow"
            >
              <ShieldCheck className="mx-auto mb-2 text-teal-400" size={40} />
              <h3 className="font-bold text-lg">AI Integration Engine</h3>
              <p className="text-xs text-slate-300 mt-2">Spatial Matching & Conflict Detection</p>
            </motion.div>
          </AnimateOnScroll>

          {/* Central AI Engine Hub — Mobile */}
          <AnimateOnScroll className="lg:hidden mb-8">
            <div className="bg-navy-900 dark:bg-slate-900 text-white p-5 rounded-2xl shadow-lg border-2 border-teal-500/60 text-center max-w-sm mx-auto">
              <ShieldCheck className="mx-auto mb-2 text-teal-400" size={36} />
              <h3 className="font-bold text-base text-white">AI Integration Engine</h3>
              <p className="text-xs text-slate-300 mt-1">Spatial Matching & Conflict Detection</p>
            </div>
          </AnimateOnScroll>

          {/* NAKSHA Survey Sources Group */}
          <div className="mb-8 lg:mb-0">
            <AnimateOnScroll>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-teal-300/30 dark:bg-teal-700/30" />
                <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider px-3 py-1 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-full whitespace-nowrap">
                  NAKSHA Survey Sources
                </span>
                <div className="h-px flex-1 bg-teal-300/30 dark:bg-teal-700/30" />
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
              staggerChildren={0.08}
            >
              {nakhaSources.map((source) => {
                const Icon = source.icon;
                return (
                  <div
                    key={source.name}
                    className="card-glass card-hover-lift p-5 flex flex-col items-center text-center h-28 sm:h-32 justify-center border-l-3 border-l-teal-400 dark:border-l-teal-500 group"
                  >
                    <Icon size={22} className="text-teal-500 dark:text-teal-400 mb-2.5 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-navy-800 dark:text-slate-200 text-xs sm:text-sm leading-snug">{source.name}</span>
                  </div>
                );
              })}
            </AnimateOnScroll>
          </div>

          {/* Spacer for central hub on desktop */}
          <div className="hidden lg:block h-20" />

          {/* Municipal & Legacy Sources Group */}
          <div className="mt-4 lg:mt-0">
            <AnimateOnScroll>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-slate-300/50 dark:bg-slate-700/50" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider px-3 py-1 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-full whitespace-nowrap">
                  Municipal & Legacy Sources
                </span>
                <div className="h-px flex-1 bg-slate-300/50 dark:bg-slate-700/50" />
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
              staggerChildren={0.08}
            >
              {legacySources.map((source) => {
                const Icon = source.icon;
                return (
                  <div
                    key={source.name}
                    className="card-glass card-hover-lift p-5 flex flex-col items-center text-center h-28 sm:h-32 justify-center group"
                  >
                    <Icon size={22} className="text-slate-500 dark:text-slate-400 mb-2.5 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-navy-800 dark:text-slate-200 text-xs sm:text-sm leading-snug">{source.name}</span>
                  </div>
                );
              })}
            </AnimateOnScroll>
          </div>
        </div>

        <AnimateOnScroll className="mt-16 text-center" delay={0.3}>
          <p className="inline-block card-glass px-6 py-3 text-slate-700 dark:text-slate-300 text-sm font-medium">
            <span className="text-teal-600 dark:text-teal-400 font-bold mr-2">✓</span>
            Built to automatically ingest and harmonize NAKSHA-generated survey outputs
          </p>
        </AnimateOnScroll>
      </div>
    </section>
  );
};

export default DataSourceEcosystem;
