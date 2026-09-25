import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const ScrollProgressTricolor = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = totalScroll / windowHeight;
      setScrollProgress(scroll * 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full h-1.5 bg-navy-900/50 absolute top-0 left-0 z-50">
      <div
        className="h-full india-tricolor-bar transition-all duration-75 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Problem', href: '#problem' },
    { name: 'Architecture', href: '#architecture' },
    { name: 'Features', href: '#features' },
    { name: 'Data Sources', href: '#data-sources' },
    { name: 'Team', href: '#team' },
  ];

  return (
    <header className="sticky top-0 z-[1020] shadow-md">
      <nav className="bg-navy-800 dark:bg-slate-900 border-b border-navy-700 dark:border-slate-800 transition-colors duration-200 relative pt-1.5">
        {/* Tri-color National Stripe filling from left to right on scroll */}
        <ScrollProgressTricolor />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center gap-2.5">
              <Link to="/" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })} className="flex items-center gap-2.5 group">
                <img
                  src="/White_Ashoka.png"
                  alt="State Emblem of India - Lion Capital of Ashoka"
                  className="h-11 sm:h-12 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white text-xl font-bold tracking-tight">Drishti <span className="text-accent-teal">AI</span></span>
                    <span className="text-[10px] text-amber-300 border border-amber-400/40 bg-amber-400/10 px-1 py-0.2 rounded-none uppercase tracking-wider font-mono font-semibold">DoLR</span>
                  </div>
                  <span className="text-[10px] text-slate-300 hidden sm:block">Govt. of India · SIH 2026</span>
                </div>
              </Link>
            </div>

            <div className="hidden md:flex space-x-6 items-center">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} className="nav-link">
                  {link.name}
                </a>
              ))}
              <div className="h-6 w-px bg-slate-700 mx-2" />
              <img src="/g20_logo.png" alt="G20 India 2023" className="h-14 sm:h-16 w-auto object-contain transition-transform hover:scale-105" />
              <ThemeToggle className="ml-1" />
              <Link to="/dashboard" className="btn-primary ml-2 inline-block">
                View Demo
              </Link>
            </div>

            <div className="md:hidden flex items-center gap-1.5">
              <ThemeToggle />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-slate-300 hover:text-white p-2"
                aria-label="Toggle Navigation Menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-navy-800 dark:bg-slate-900 border-t border-navy-700 dark:border-slate-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-navy-700 dark:hover:bg-slate-800 rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="px-3 py-2">
                <Link to="/dashboard" className="btn-primary w-full text-center block">
                  View Demo
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
