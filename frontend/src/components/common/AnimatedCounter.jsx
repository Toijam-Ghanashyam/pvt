import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

/**
 * AnimatedCounter — Smoothly counts up from 0 to a target number
 * when the element enters the viewport.
 *
 * @param {number}  to        - Target number to count up to
 * @param {number}  from      - Starting number (default: 0)
 * @param {number}  duration  - Animation duration in ms (default: 2000)
 * @param {string}  suffix    - Text appended after the number (e.g. '%', '+', 'ha')
 * @param {string}  prefix    - Text prepended before the number (e.g. '₹')
 * @param {boolean} decimals  - Number of decimal places (default: 0)
 * @param {string}  className - Additional CSS classes
 * @param {boolean} separator - Whether to add commas as thousand separators (default: true)
 */
const AnimatedCounter = ({
  to,
  from = 0,
  duration = 2000,
  suffix = '',
  prefix = '',
  decimals = 0,
  className = '',
  separator = true,
}) => {
  const [count, setCount] = useState(from);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = performance.now();
    const startVal = from;
    const endVal = to;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const currentValue = startVal + (endVal - startVal) * easedProgress;

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, from, to, duration]);

  const formatNumber = (num) => {
    const fixed = num.toFixed(decimals);
    if (!separator) return fixed;
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  return (
    <span ref={ref} className={className}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  );
};

export default AnimatedCounter;
