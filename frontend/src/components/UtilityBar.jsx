import React from 'react';

const UtilityBar = () => {
  return (
    <div className="bg-navy-900 text-white py-1 px-4 text-xs sm:text-sm font-medium">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="bg-navy-700 px-2 py-0.5 rounded text-slate-200">PS26013</span>
        </div>
        <div className="text-center sm:text-left mt-1 sm:mt-0 text-slate-300">
          Ministry of Rural Development — Dept. of Land Resources (DoLR)
        </div>
        <div className="hidden md:block text-slate-300">
          Smart India Hackathon 2026
        </div>
      </div>
    </div>
  );
};

export default UtilityBar;
