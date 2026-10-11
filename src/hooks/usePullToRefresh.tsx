import { useRef, useCallback, useState } from 'react';

interface PullToRefreshConfig {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPullDistance?: number;
}

/**
 * Hook to enable pull-to-refresh functionality
 * Returns touch handlers and refresh state
 */
export const usePullToRefresh = (config: PullToRefreshConfig) => {
  const { onRefresh, threshold = 80, maxPullDistance = 120 } = config;
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef<number>(0);
  const scrollableElement = useRef<HTMLElement | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const target = e.currentTarget as HTMLElement;
    scrollableElement.current = target;
    
    // Only start tracking if at the top
    if (target.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isRefreshing || touchStartY.current === 0) return;
    
    const target = e.currentTarget as HTMLElement;
    if (target.scrollTop > 0) {
      touchStartY.current = 0;
      setPullDistance(0);
      return;
    }

    const touchY = e.touches[0].clientY;
    const distance = touchY - touchStartY.current;

    if (distance > 0) {
      // Prevent default to disable native scroll while pulling
      e.preventDefault();
      
      // Apply diminishing returns to pull distance
      const dampedDistance = Math.min(
        distance * 0.5,
        maxPullDistance
      );
      setPullDistance(dampedDistance);
    }
  }, [isRefreshing, maxPullDistance]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold);
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        touchStartY.current = 0;
      }
    } else {
      setPullDistance(0);
      touchStartY.current = 0;
    }
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  const isReady = pullDistance >= threshold;

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isRefreshing,
    pullDistance,
    isReady,
  };
};
