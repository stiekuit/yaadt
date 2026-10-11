import { useState, useEffect } from 'react';

/**
 * Hook to get the actual device viewport height
 * Uses dvh (dynamic viewport height) when available, falls back to vh
 * Handles mobile browser address bar changes
 */
export const useDeviceHeight = () => {
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    const updateHeight = () => {
      // Try to use dvh first, fallback to innerHeight
      const dvhSupported = CSS.supports('height', '100dvh');
      if (dvhSupported) {
        setHeight(window.innerHeight);
      } else {
        setHeight(window.innerHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
    };
  }, []);

  return height;
};
