import React from 'react';
import AnimateOnScroll from './common/AnimateOnScroll';

const TechStack = () => {
  const technologies = [
    "AI/ML", "GeoAI", "GIS & Web-GIS", "Spatial Databases", "ETL Automation", 
    "Computer Vision", "Cloud Computing", "Spatial Analytics", "API Integration Frameworks"
  ];

  return (
    <section className="py-16 lg:py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <AnimateOnScroll>
          <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8">Powered By</h3>
        </AnimateOnScroll>
        <AnimateOnScroll
          className="grid grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 max-w-3xl mx-auto"
          staggerChildren={0.06}
        >
          {technologies.map((tech, index) => (
            <span
              key={index}
              className="inline-flex items-center justify-center px-4 py-2.5 card-glass text-slate-600 dark:text-slate-300 text-sm font-medium hover:border-teal-300 dark:hover:border-teal-500 hover:text-teal-700 dark:hover:text-teal-300 hover:scale-105 transition-all duration-300 cursor-default"
            >
              {tech}
            </span>
          ))}
        </AnimateOnScroll>
      </div>
    </section>
  );
};

export default TechStack;
