import React from 'react';
import { Shield, ExternalLink } from 'lucide-react';
import { AshokaChakra } from './GovEmblems';

/**
 * GovFooter — Standard Indian Government Portal Footer.
 * Formatted strictly according to National Portal (india.gov.in) guidelines.
 */

const GovFooter = () => {
  return (
    <footer className="w-full bg-[#0b1e36] dark:bg-[#050e1a] text-slate-300 border-t-2 border-[#1b3a63] mt-auto select-none">
      {/* Top Footer Ribbon */}
      <div className="max-w-[1920px] mx-auto px-3 sm:px-6 py-4 border-b border-[#152e50]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AshokaChakra className="w-8 h-8 opacity-80" spokeColor="#60a5fa" ringColor="#93c5fd" />
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                GeoHarmonize AI · SIH 2026 Prototype
              </p>
              <p className="text-[11px] text-slate-400">
                Department of Land Resources (DoLR) · Ministry of Rural Development
              </p>
            </div>
          </div>

          {/* Official Policy Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-300">
            <a href="#terms" className="hover:text-amber-300 transition-colors">Terms of Use</a>
            <span>•</span>
            <a href="#privacy" className="hover:text-amber-300 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#hyperlink" className="hover:text-amber-300 transition-colors">Hyperlinking Policy</a>
            <span>•</span>
            <a href="#copyright" className="hover:text-amber-300 transition-colors">Copyright Policy</a>
            <span>•</span>
            <a href="#disclaimer" className="hover:text-amber-300 transition-colors">Disclaimer</a>
            <span>•</span>
            <a href="#accessibility" className="hover:text-amber-300 transition-colors">Accessibility Statement</a>
          </div>
        </div>
      </div>

      {/* Bottom Compliance & Hosting Attribution */}
      <div className="max-w-[1920px] mx-auto px-3 sm:px-6 py-3 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <p>
          Content Owned and Maintained by{' '}
          <strong className="text-slate-200">Department of Land Resources (DoLR)</strong>, Ministry of Rural Development, Government of India.
        </p>
        <p className="font-mono text-[10px] text-slate-400">
          Hosted by National Informatics Centre (NIC) · Node v2026.09.16
        </p>
      </div>

      {/* Tricolor accent bar */}
      <div className="india-tricolor-bar" />
    </footer>
  );
};

export default GovFooter;
