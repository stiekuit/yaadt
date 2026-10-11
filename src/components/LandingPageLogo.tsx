import React from 'react';
import { useBranding } from '@/contexts/BrandingContext';

interface LandingPageLogoProps {
  className?: string;
}

const LandingPageLogo = ({ className = '' }: LandingPageLogoProps) => {
  const { 
    logoUrl, 
    logoPlacement, 
    logoSize, 
    logoCustomWidth, 
    logoCustomHeight,
    siteName,
    showSiteNameOnLanding 
  } = useBranding();

  const getLogoSizeClasses = () => {
    switch (logoSize) {
      case 'small':
        return 'w-16 h-16';
      case 'medium':
        return 'w-24 h-24';
      case 'large':
        return 'w-32 h-32';
      case 'full-width':
        return 'w-full h-auto max-w-md';
      case 'custom':
        return '';
      default:
        return 'w-24 h-24';
    }
  };

  const getCustomSizeStyles = () => {
    if (logoSize === 'custom' && (logoCustomWidth || logoCustomHeight)) {
      return {
        width: logoCustomWidth ? `${logoCustomWidth}px` : 'auto',
        height: logoCustomHeight ? `${logoCustomHeight}px` : 'auto',
      };
    }
    return {};
  };

  const getLogoPlacementClasses = () => {
    switch (logoPlacement) {
      case 'top-left':
        return 'flex items-start justify-start';
      case 'top-center':
        return 'flex items-center justify-center';
      case 'full-page':
        return 'flex flex-col items-center justify-center min-h-[60vh]';
      case 'background':
        return 'flex items-center justify-center opacity-10 absolute inset-0 pointer-events-none';
      default:
        return 'flex items-center justify-center';
    }
  };

  const logoElement = (
    <img 
      src={logoUrl || "/lovable-uploads/2aecadba-fc7d-4144-9630-81e227016a4a.png"} 
      alt={`${siteName} Logo`} 
      className={`object-contain ${logoSize !== 'custom' ? getLogoSizeClasses() : ''} ${className}`}
      style={getCustomSizeStyles()}
      onError={(e) => {
        console.warn('Logo failed to load, using fallback');
        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSJjdXJyZW50Q29sb3IiLz4KPHN2Zz4K';
      }}
    />
  );

  const titleElement = showSiteNameOnLanding && (
    <div className="text-center">
      <h1 className="text-2xl font-bold text-foreground">{siteName}</h1>
      <p className="text-muted-foreground">Support Portal</p>
    </div>
  );

  if (logoPlacement === 'background') {
    return (
      <div className={getLogoPlacementClasses()}>
        {logoElement}
      </div>
    );
  }

  if (logoPlacement === 'full-page') {
    return (
      <div className={`${getLogoPlacementClasses()} mb-8`}>
        {logoElement}
        {titleElement && <div className="mt-4">{titleElement}</div>}
      </div>
    );
  }

  return (
    <div className={`${getLogoPlacementClasses()} mb-8`}>
      <div className="text-center">
        {logoElement}
        {titleElement && <div className="mt-4">{titleElement}</div>}
      </div>
    </div>
  );
};

export default LandingPageLogo;