import React from 'react';
import AnimateOnScroll from './common/AnimateOnScroll';

const Footer = () => {
  return (
    <footer className="bg-navy-900 text-slate-400 py-12 lg:py-16 border-t border-navy-800 relative">
      {/* Gradient separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />

      <AnimateOnScroll className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        
        <div className="mb-0 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
            <span className="text-white text-xl font-bold tracking-tight">GeoHarmonize <span className="text-accent-teal">AI</span></span>
            <span className="text-xs bg-navy-800 text-slate-300 px-2 py-0.5 rounded-lg border border-navy-700">PS26013</span>
          </div>
          <p className="text-sm">Team <span className="text-white font-medium">The Intellect</span></p>
        </div>

        <div className="text-center md:text-right max-w-lg">
          <p className="text-xs leading-relaxed border-l-3 border-l-amber-500/60 bg-navy-800/50 p-4 rounded-lg text-slate-500">
            <strong className="text-slate-400">Disclaimer:</strong> This is a hackathon prototype proposal for Smart India Hackathon 2026. It is not a live government system, and no actual government data is exposed or represented.
          </p>
        </div>
        
      </AnimateOnScroll>
    </footer>
  );
};

export default Footer;
