import { useState, useEffect } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type Orientation = 'portrait' | 'landscape';
export type LayoutTier = 'compact' | 'balanced' | 'expanded';

interface AdaptiveState {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  orientation: Orientation;
  isTouch: boolean;
  layoutTier: LayoutTier;
  scaleFactor: number;
}

const BREAKPOINTS: Record<Breakpoint, number> = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function useAdaptiveSystem() {
  const [state, setState] = useState<AdaptiveState>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    breakpoint: 'lg',
    orientation: 'landscape',
    isTouch: false,
    layoutTier: 'balanced',
    scaleFactor: 1,
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      // Determine Breakpoint
      let bp: Breakpoint = 'xs';
      if (w >= BREAKPOINTS['2xl']) bp = '2xl';
      else if (w >= BREAKPOINTS.xl) bp = 'xl';
      else if (w >= BREAKPOINTS.lg) bp = 'lg';
      else if (w >= BREAKPOINTS.md) bp = 'md';
      else if (w >= BREAKPOINTS.sm) bp = 'sm';

      // Determine Orientation
      const orientation: Orientation = w > h ? 'landscape' : 'portrait';

      // Detect Touch (Pointer Coarse)
      const isTouch = window.matchMedia('(pointer: coarse)').matches;

      // Determine Layout Tier
      let layoutTier: LayoutTier = 'balanced';
      if (w < BREAKPOINTS.md) layoutTier = 'compact';
      else if (w > BREAKPOINTS.xl) layoutTier = 'expanded';

      // Calculate Scale Factor (Dynamic sizing multiplier)
      // Base is 1440px width
      const scaleFactor = Math.min(Math.max(w / 1440, 0.8), 1.25);

      setState({
        width: w,
        height: h,
        breakpoint: bp,
        orientation,
        isTouch,
        layoutTier,
        scaleFactor,
      });

      // Inject global CSS variables for real-time styling
      document.documentElement.style.setProperty('--ui-scale', scaleFactor.toString());
      document.documentElement.setAttribute('data-tier', layoutTier);
      document.documentElement.setAttribute('data-touch', isTouch.toString());
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return state;
}
