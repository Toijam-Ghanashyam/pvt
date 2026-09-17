import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardProvider, useDashboard } from '../context/DashboardContext';
import GovHeader from '../components/common/GovHeader';
import GovFooter from '../components/common/GovFooter';
import Toast from '../components/dashboard/Toast';

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
};

const DashboardContent = () => {
  const { toast, setToast } = useDashboard();
  const location = useLocation();
  const previousPathnameRef = React.useRef(null);

  // Show full header and navbar by default on initial dashboard arrival (single time).
  // On subsequent navigation between sub-pages/features, automatically scroll down to content so navbar is not shown.
  useEffect(() => {
    // Initial mount behavior
    if (previousPathnameRef.current === null) {
      previousPathnameRef.current = location.pathname;
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      
      // Reinforce scroll to top to beat browser scroll restoration/layout shifts
      const timer = setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }, 50);
      
      return () => clearTimeout(timer);
    }

    // Ignore duplicate strict-mode runs or identical navigations
    if (previousPathnameRef.current === location.pathname) {
      return;
    }

    // Pathname has changed; update ref and scroll to content
    previousPathnameRef.current = location.pathname;

    const scrollToContent = () => {
      const contentElement = document.getElementById('main-content');
      if (contentElement) {
        const top = contentElement.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    };

    scrollToContent();
    const frameId = requestAnimationFrame(scrollToContent);
    const timer = setTimeout(scrollToContent, 40);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timer);
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#f4f6f9] dark:bg-[#070e17] flex flex-col text-slate-900 dark:text-slate-100 transition-colors">
      <GovHeader />

      <main id="main-content" className="flex-1 flex flex-col w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            className="flex-1 flex flex-col"
            {...pageTransition}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <GovFooter />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

const DashboardLayout = () => {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
};

export default DashboardLayout;
