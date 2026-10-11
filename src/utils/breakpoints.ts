export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
} as const;

export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= BREAKPOINTS.mobile;
};

export const isTablet = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth > BREAKPOINTS.mobile && window.innerWidth <= BREAKPOINTS.desktop;
};

export const isDesktop = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth > BREAKPOINTS.desktop;
};

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

export const getCurrentBreakpoint = (): Breakpoint => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width <= BREAKPOINTS.mobile) return 'mobile';
  if (width <= BREAKPOINTS.tablet) return 'tablet';
  if (width <= BREAKPOINTS.desktop) return 'desktop';
  return 'wide';
};
