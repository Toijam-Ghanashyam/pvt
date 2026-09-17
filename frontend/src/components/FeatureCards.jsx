import React from 'react';
import { Activity, Network, Scale, Users } from 'lucide-react';
import AnimateOnScroll from './common/AnimateOnScroll';

const FeatureCards = () => {
  const features = [
    {
      icon: <Scale className="text-teal-400" size={28} />,
      title: "Intelligent Source Trust Engine",
      today: "Equal weight given to all conflicting sources.",
      adds: "Dynamic trust scoring based on positional accuracy, freshness, and agreement."
    },
    {
      icon: <Activity className="text-teal-400" size={28} />,
      title: "Explainable Conflict Resolution",
      today: "Black-box outputs with no reasoning.",
      adds: "Transparent reasoning showing which sources disagree, how much, and why."
    },
    {
      icon: <Users className="text-teal-400" size={28} />,
      title: "Smart Conflict Triage",
      today: "All conflicts require manual human review.",
      adds: "Confidence-based routing (auto-approve, review queue, mandatory verification)."
    },
    {
      icon: <Network className="text-teal-400" size={28} />,
      title: "Conflict Root-Cause Clustering",
      today: "Conflicts are handled one-by-one.",
      adds: "Groups similar conflicts to surface shared causes (e.g., coordinate shift)."
    }
  ];

  return (
    <section id="features" className="section-spacing bg-navy-900 dark:bg-slate-950 text-white transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center max-w-3xl mx-auto mb-14 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">Core Capabilities</h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Moving beyond simple map visualization to intelligent, explainable geospatial resolution.
          </p>
        </AnimateOnScroll>

        <AnimateOnScroll
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
          staggerChildren={0.12}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-navy-800/80 dark:bg-slate-900/80 backdrop-blur-sm border border-navy-700/60 dark:border-slate-800/60 p-6 sm:p-10 rounded-2xl hover:border-teal-500/40 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="flex items-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-500/5 border border-teal-500/20 flex items-center justify-center mr-4 group-hover:scale-110 group-hover:shadow-glow-teal transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white">{feature.title}</h3>
              </div>
              
              <div className="space-y-5">
                {/* "What today misses" — subtle left border accent */}
                <div className="border-l-3 border-l-slate-600/60 pl-4">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1.5 block">What today misses</span>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {feature.today}
                  </p>
                </div>
                {/* "What this adds" — teal left border accent */}
                <div className="border-l-3 border-l-teal-500/60 pl-4">
                  <span className="text-[11px] uppercase tracking-wider text-teal-400 font-bold mb-1.5 block">What this adds</span>
                  <p className="text-slate-200 text-sm leading-relaxed">
                    {feature.adds}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </AnimateOnScroll>
      </div>
    </section>
  );
};

export default FeatureCards;
