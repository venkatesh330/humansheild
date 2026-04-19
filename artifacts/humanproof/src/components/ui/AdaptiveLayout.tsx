import React, { ReactNode } from 'react';
import { useAdaptiveSystem } from '../../hooks/useAdaptiveSystem';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AdaptiveLayoutProps {
  children: ReactNode;
  className?: string;
  /** Breakpoint at which to switch from stacked to side-by-side (default: md) */
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl';
  /** Strategy for layout: 'flex' or 'grid' */
  strategy?: 'flex' | 'grid';
  /** Gap between elements */
  gap?: string;
  /** Whether to animate transitions between layouts */
  animate?: boolean;
}

/**
 * A layout component that intelligently switches between stacked and side-by-side layouts
 * based on the adaptive system's current state.
 */
export const AdaptiveLayout: React.FC<AdaptiveLayoutProps> = ({
  children,
  className,
  breakpoint = 'md',
  strategy = 'flex',
  gap = 'var(--space-8)',
  animate = true,
}) => {
  const { width } = useAdaptiveSystem();
  
  const getBreakpointValue = (bp: string) => {
    switch (bp) {
      case 'sm': return 640;
      case 'md': return 768;
      case 'lg': return 1024;
      case 'xl': return 1280;
      default: return 768;
    }
  };

  const isStacked = width < getBreakpointValue(breakpoint);

  const containerClasses = cn(
    'adaptive-layout-root',
    strategy === 'flex' ? 'flex' : 'grid',
    isStacked ? (strategy === 'flex' ? 'flex-col' : 'grid-cols-1') : (strategy === 'flex' ? 'flex-row' : 'grid-cols-2'),
    className
  );

  const style = {
    gap: gap,
  };

  if (!animate) {
    return (
      <div className={containerClasses} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      layout
      className={containerClasses}
      style={style}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <AnimatePresence mode="popLayout">
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="adaptive-layout-item w-full h-full"
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};
