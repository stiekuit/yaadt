import { ReactNode } from 'react';
import { MobileBottomNav } from './MobileBottomNav';

interface MobileLayoutProps {
  children: ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const MobileLayout = ({ children, activeSection, onSectionChange }: MobileLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main content area - add padding at bottom for nav */}
      <main className="flex-1 pb-16 overflow-auto">
        {children}
      </main>
      
      {/* Fixed bottom navigation */}
      <MobileBottomNav 
        activeSection={activeSection} 
        onSectionChange={onSectionChange} 
      />
    </div>
  );
};
