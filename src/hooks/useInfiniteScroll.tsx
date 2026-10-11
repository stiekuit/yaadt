import { useEffect, useRef, useState } from 'react';

interface InfiniteScrollConfig {
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  threshold?: number;
}

/**
 * Hook to enable infinite scroll functionality
 * Returns ref to attach to sentinel element and loading state
 */
export const useInfiniteScroll = (config: InfiniteScrollConfig) => {
  const { onLoadMore, hasMore, threshold = 0.8 } = config;
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;

    const options = {
      root: null,
      rootMargin: '0px',
      threshold,
    };

    observerRef.current = new IntersectionObserver(async (entries) => {
      const target = entries[0];
      
      if (target.isIntersecting && hasMore && !isLoading) {
        setIsLoading(true);
        try {
          await onLoadMore();
        } finally {
          setIsLoading(false);
        }
      }
    }, options);

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, onLoadMore, threshold]);

  return {
    sentinelRef,
    isLoading,
  };
};
