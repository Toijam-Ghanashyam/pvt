import React from 'react';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimateOnScroll from './common/AnimateOnScroll';

const ProgressBar = ({ percentage, color, delay = 0 }) => (
  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden">
    <motion.div
      className={`h-full rounded-full ${color}`}
      initial={{ width: 0 }}
      whileInView={{ width: `${percentage}%` }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, delay: delay + 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    />
  </div>
);

const ConfidencePreview = () => {
  const parcels = [
    { id: "P-1042", source: "Drone + Cadastral", status: "High", color: "bg-green-500", bg: "bg-green-50/80 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800/60", icon: <CheckCircle className="text-green-600 dark:text-green-400" size={18} /> },
    { id: "P-1043", source: "Drone Only", status: "Medium", color: "bg-amber-500", bg: "bg-amber-50/80 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800/60", icon: <Clock className="text-amber-600 dark:text-amber-400" size={18} /> },
    { id: "P-1044", source: "Municipal + Drone", status: "High", color: "bg-green-500", bg: "bg-green-50/80 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800/60", icon: <CheckCircle className="text-green-600 dark:text-green-400" size={18} /> },
    { id: "P-1045", source: "Cadastral Conflict", status: "Low", color: "bg-red-500", bg: "bg-red-50/80 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800/60", icon: <AlertTriangle className="text-red-600 dark:text-red-400" size={18} /> },
    { id: "P-1046", source: "GNSS + Municipal", status: "Medium", color: "bg-amber-500", bg: "bg-amber-50/80 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800/60", icon: <Clock className="text-amber-600 dark:text-amber-400" size={18} /> },
    { id: "P-1047", source: "Drone + GT", status: "High", color: "bg-green-500", bg: "bg-green-50/80 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800/60", icon: <CheckCircle className="text-green-600 dark:text-green-400" size={18} /> },
  ];

  const confidenceLevels = [
    {
      title: "High Confidence",
      description: "Sources agree. Automated approval and sync with land records.",
      color: "bg-emerald-500",
      barColor: "bg-gradient-to-r from-emerald-500 to-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
      borderColor: "border-emerald-200 dark:border-emerald-800/50",
      percentage: 85,
    },
    {
      title: "Medium Confidence",
      description: "Minor mismatches or old data. Routed to review queue.",
      color: "bg-amber-500",
      barColor: "bg-gradient-to-r from-amber-500 to-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      borderColor: "border-amber-200 dark:border-amber-800/50",
      percentage: 58,
    },
    {
      title: "Low Confidence / High Impact",
      description: "Major conflicts or overlaps. Mandatory manual verification required.",
      color: "bg-red-500",
      barColor: "bg-gradient-to-r from-red-500 to-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/30",
      borderColor: "border-red-200 dark:border-red-800/50",
      percentage: 22,
    },
  ];

  return (
    <section className="section-spacing bg-slate-50 dark:bg-slate-950 border-t border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          <AnimateOnScroll direction="left">
            <h2 className="section-title">Confidence & Trust Preview</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              The system assigns a dynamic confidence score to every integrated output, enabling a smart human-in-the-loop review workflow.
            </p>

            <div className="space-y-5">
              {confidenceLevels.map((level, index) => (
                <div key={level.title} className={`p-4 rounded-xl border ${level.borderColor} ${level.bgColor}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`w-3 h-3 rounded-full ${level.color} shrink-0`} />
                    <h4 className="font-bold text-navy-900 dark:text-slate-100 text-sm">{level.title}</h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 pl-6">{level.description}</p>
                  <div className="pl-6">
                    <ProgressBar percentage={level.percentage} color={level.barColor} delay={index * 0.2} />
                  </div>
                </div>
              ))}
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll direction="right">
            <div className="card-glass p-5 sm:p-6 transition-colors">
              <div className="flex justify-between items-center mb-5 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-200/60 dark:border-slate-700/40">
                <h3 className="font-bold text-sm sm:text-base text-navy-800 dark:text-slate-100">Recent Parcel Integrations</h3>
                <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live View
                </span>
              </div>
              
              <AnimateOnScroll
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
                staggerChildren={0.08}
              >
                {parcels.map((parcel, index) => (
                  <div key={index} className={`p-4 rounded-xl border ${parcel.border} ${parcel.bg} flex justify-between items-start transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm`}>
                    <div>
                      <span className="font-mono text-sm font-bold text-navy-900 dark:text-slate-100">{parcel.id}</span>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{parcel.source}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      {parcel.icon}
                      <span className={`text-[10px] uppercase font-bold mt-2 ${parcel.status === 'High' ? 'text-green-700 dark:text-green-400' : parcel.status === 'Medium' ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400'}`}>
                        {parcel.status}
                      </span>
                    </div>
                  </div>
                ))}
              </AnimateOnScroll>
            </div>
          </AnimateOnScroll>

        </div>
      </div>
    </section>
  );
};

export default ConfidencePreview;
