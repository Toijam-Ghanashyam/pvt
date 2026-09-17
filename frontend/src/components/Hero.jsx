import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  Activity,
  Sparkles,
  MapPin,
  Zap,
  Database,
  Target,
} from 'lucide-react';
import AnimatedCounter from './common/AnimatedCounter';

/* ── 3 Slide Background Images with Real Urban & National Land Imagery ── */
const SLIDES = [
  {
    image: '/INDIA.jpg',
    badge: 'National Macro-Scale GIS',
    title: 'Topographic Satellite & Geodetic Framework',
    description:
      'Harmonizing multi-resolution satellite feeds and Survey of India CORS-GNSS baseline vectors across the subcontinent.',
  },
  {
    image: '/india_buildings.jpg',
    badge: 'High-Density Cadastral Abadi',
    title: 'NAKSHA Drone Survey & Parcel Harmonization',
    description:
      'Resolving fragmented rural-urban fringe settlements and reconciling overlapping revenue boundaries with sub-meter spatial accuracy.',
  },
  {
    image: '/india_roadxbuilds.jpg',
    badge: 'Urban Infrastructure Corridor',
    title: 'Municipal Masterplans & Right-of-Way Matching',
    description:
      'Automated conflict detection between municipal zoning, transport rights-of-way, utility networks, and private land titles.',
  },
];

/* ── Telemetry KPIs (decorative animated counters) ── */
const TELEMETRY = [
  { label: 'Parcels Harmonized', value: 12847, icon: MapPin, color: 'text-teal-400', suffix: '' },
  { label: 'Conflicts Resolved', value: 1204, icon: Zap, color: 'text-amber-400', suffix: '' },
  { label: 'Data Sources', value: 10, icon: Database, color: 'text-blue-400', suffix: '+' },
  { label: 'Spatial Accuracy', value: 99.2, icon: Target, color: 'text-emerald-400', suffix: '%', decimals: 1 },
];

/* ── Animation Variants ── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, x: 60, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.8, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Automatic slide crossfade every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative w-full h-[calc(100vh-100px)] min-h-[600px] max-h-[960px] flex items-center overflow-hidden bg-slate-950 text-white select-none"
      aria-label="National Land Records Harmonization Hero"
    >
      {/* ── 1. Full-Width Background Images with Smooth Crossfade ── */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.image}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className={`w-full h-full object-cover object-center transform transition-transform duration-[6000ms] ease-out ${
                  isActive ? 'scale-110' : 'scale-100'
                }`}
                loading="eager"
              />
            </div>
          );
        })}

        {/* ── 2. Subtle Dark Overlays for High Contrast & Text Legibility ── */}
        <div className="absolute inset-0 z-20 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/50 pointer-events-none" />
        <div className="absolute inset-0 z-20 bg-radial from-transparent via-slate-950/40 to-slate-950/75 pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-32 z-20 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />
      </div>

      {/* ── 3. Main Hero Content — Grid Layout ── */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">

          {/* Left Content — 3 cols */}
          <motion.div
            className="lg:col-span-3 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* DoLR Mandate Pill */}
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2.5 bg-slate-900/70 border border-slate-700/60 px-4 py-2 backdrop-blur-md shadow-lg rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Department of Land Resources · DoLR (PS26013)
                </span>
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold leading-[1.12] tracking-tight text-white drop-shadow-sm"
            >
              Automated Harmonization of{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-teal-300 to-emerald-400">
                Multi-source Urban Land Records
              </span>
            </motion.h1>

            {/* Descriptive Narrative */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed drop-shadow-sm font-normal"
            >
              Replacing fragmented manual workflows with intelligent spatial matching. Built to
              ingest, validate, and synchronize NAKSHA survey outputs, satellite orthomosaics, and
              municipal GIS registers into a verifiable single source of truth.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2"
            >
              <Link
                to="/dashboard"
                className="btn-primary flex justify-center items-center gap-2 px-7 py-3.5 text-sm font-bold shadow-lg shadow-teal-900/30 group hover:scale-[1.02] transition-all duration-200 rounded-lg"
              >
                <span>Launch Live Prototype</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#architecture"
                className="btn-secondary flex justify-center items-center gap-2 px-7 py-3.5 text-sm font-bold bg-slate-900/60 hover:bg-slate-800/80 border-slate-600 backdrop-blur-sm hover:scale-[1.02] transition-all duration-200 rounded-lg"
              >
                <span>Explore Architecture</span>
              </a>
            </motion.div>

            {/* Micro Feature Highlights */}
            <motion.div
              variants={itemVariants}
              className="pt-3 flex flex-wrap items-center gap-5 sm:gap-7 text-xs text-slate-300"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck size={14} className="text-emerald-400" />
                </div>
                <span>Survey of India CORS Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Activity size={14} className="text-blue-400" />
                </div>
                <span>Sub-Centimeter Orthorectification</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Sparkles size={14} className="text-amber-400" />
                </div>
                <span>AI Encroachment Engine</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content — Telemetry Card (2 cols) */}
          <motion.div
            className="lg:col-span-2 hidden lg:block"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl shadow-black/20 relative overflow-hidden">
              {/* Subtle gradient accent at top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-amber-400 to-emerald-500" />

              <div className="flex items-center justify-between mb-5 pt-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Live System Telemetry
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded">
                  PROTOTYPE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {TELEMETRY.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4 hover:bg-slate-800/70 hover:border-slate-600/50 transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-2 mb-2.5">
                        <Icon size={16} className={`${item.color} group-hover:scale-110 transition-transform`} />
                        <span className="text-[11px] font-medium text-slate-400 leading-tight">
                          {item.label}
                        </span>
                      </div>
                      <div className="text-2xl font-black text-white font-mono tracking-tight">
                        <AnimatedCounter
                          to={item.value}
                          duration={2200}
                          suffix={item.suffix}
                          decimals={item.decimals || 0}
                          separator={item.value > 999}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom status bar */}
              <div className="mt-5 pt-4 border-t border-slate-700/40 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono">PostGIS Cluster · Active</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  All systems operational
                </span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ── 4. Slide Indicators ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              index === currentSlide
                ? 'w-8 bg-teal-400'
                : 'w-3 bg-slate-600 hover:bg-slate-500'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
