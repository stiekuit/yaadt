import React from 'react';
import { useBranding } from '@/contexts/BrandingContext';

const YaadtFooter = () => {
  const { yaadtFooterEnabled } = useBranding();

  if (!yaadtFooterEnabled) return null;

  return (
    <footer className="fixed bottom-0 right-0 p-4">
      <div className="text-xs text-muted-foreground">
        Powered by{' '}
        <a 
          href="https://yaadt.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          yaadt.com
        </a>
      </div>
    </footer>
  );
};

export default YaadtFooter;