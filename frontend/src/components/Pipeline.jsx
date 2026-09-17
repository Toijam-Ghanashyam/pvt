import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, CheckCircle, Database, Eye, FileSearch, HelpCircle, Shuffle } from 'lucide-react';
import AnimateOnScroll from './common/AnimateOnScroll';

const Pipeline = () => {
  const steps = [
    { id: 1, title: "Ingest", icon: <Database size={22} />, desc: "Multi-source import", color: 'from-blue-500 to-blue-600' },
    { id: 2, title: "AI Spatial Matching", icon: <Shuffle size={22} />, desc: "Geometry alignment", color: 'from-teal-500 to-teal-600' },
    { id: 3, title: "Conflict Detection", icon: <FileSearch size={22} />, desc: "Identify mismatches", color: 'from-amber-500 to-amber-600' },
    { id: 4, title: "Confidence Scoring", icon: <HelpCircle size={22} />, desc: "Rate reliability", color: 'from-purple-500 to-purple-600' },
    { id: 5, title: "Human Review", icon: <Eye size={22} />, desc: "Verify low confidence", color: 'from-rose-500 to-rose-600' },
    { id: 6, title: "Harmonized Record", icon: <CheckCircle size={22} />, desc: "Final cadastral output", color: 'from-emerald-500 to-emerald-600' },
  ];

  const stepVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: i * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    }),
  };

  return (
    <section id="architecture" className="section-spacing bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center max-w-3xl mx-auto mb-14 lg:mb-16">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            A streamlined, automated pipeline from raw disconnected data to a finalized, verified urban land record.
          </p>
        </AnimateOnScroll>

        {/* Desktop Pipeline */}
        <div className="hidden lg:flex justify-between items-start relative px-4">
          {/* Animated gradient connector line */}
          <motion.div
            className="absolute left-16 right-16 top-8 h-0.5 z-0 rounded-full"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ transformOrigin: 'left', background: 'linear-gradient(90deg, #0d9488, #10b981, #0d9488)' }}
          />

          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className="flex flex-col items-center w-36 lg:w-40 relative z-10"
              custom={index}
              variants={stepVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              {/* Step Circle */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} text-white flex items-center justify-center mb-4 shadow-lg relative group hover:scale-110 transition-transform duration-300`}>
                {step.icon}
                {/* Step number */}
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-xs font-bold text-navy-900 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 shadow-sm">
                  {step.id}
                </div>
              </div>

              <h3 className="font-bold text-navy-900 dark:text-slate-100 text-sm text-center mb-1.5">{step.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center leading-tight">{step.desc}</p>

              {/* Animated chevron between steps (desktop) */}
              {index < steps.length - 1 && (
                <motion.div
                  className="absolute -right-4 top-7 text-teal-400/60"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Mobile Pipeline */}
        <div className="lg:hidden">
          <AnimateOnScroll className="flex flex-col items-center space-y-3" staggerChildren={0.1}>
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center w-full max-w-sm card-glass p-4 group">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} text-white flex items-center justify-center mr-4 shrink-0 relative group-hover:scale-110 transition-transform`}>
                    {step.icon}
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-[10px] font-bold text-navy-900 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                      {step.id}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900 dark:text-slate-100">{step.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{step.desc}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="text-teal-400/50">
                    <ArrowDown size={20} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
};

export default Pipeline;
