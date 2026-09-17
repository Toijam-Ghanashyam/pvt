import React from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * AnimateOnScroll — A reusable wrapper that animates children into view
 * when they enter the viewport. Supports staggered children animations.
 *
 * @param {string}  direction       - 'up' | 'left' | 'right' (default: 'up')
 * @param {number}  delay           - Delay before animation starts (seconds)
 * @param {number}  duration        - Animation duration (seconds)
 * @param {number}  staggerChildren - Delay between each child's animation (seconds)
 * @param {string}  className       - Additional CSS classes
 * @param {boolean} once            - Whether to only animate once (default: true)
 * @param {number}  amount          - How much of the element needs to be visible (0-1)
 */
const AnimateOnScroll = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  staggerChildren = 0,
  className = '',
  once = true,
  amount = 0.15,
  as = 'div',
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once, amount });

  const directionOffsets = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: -40, y: 0 },
    right: { x: 40, y: 0 },
    none: { x: 0, y: 0 },
  };

  const offset = directionOffsets[direction] || directionOffsets.up;

  // If staggerChildren is set, use container + item variant pattern
  if (staggerChildren > 0) {
    const containerVariants = {
      hidden: {},
      visible: {
        transition: {
          staggerChildren,
          delayChildren: delay,
        },
      },
    };

    const itemVariants = {
      hidden: {
        opacity: 0,
        y: offset.y,
        x: offset.x,
      },
      visible: {
        opacity: 1,
        y: 0,
        x: 0,
        transition: {
          duration,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      },
    };

    const MotionComponent = motion[as] || motion.div;

    return (
      <MotionComponent
        ref={ref}
        className={className}
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;
          return (
            <motion.div variants={itemVariants}>
              {child}
            </motion.div>
          );
        })}
      </MotionComponent>
    );
  }

  // Simple single-element animation (no stagger)
  const MotionComponent = motion[as] || motion.div;

  return (
    <MotionComponent
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: offset.y, x: offset.x }}
      animate={
        isInView
          ? { opacity: 1, y: 0, x: 0 }
          : { opacity: 0, y: offset.y, x: offset.x }
      }
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </MotionComponent>
  );
};

export default AnimateOnScroll;
