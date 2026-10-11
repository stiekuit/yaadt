import { ReactNode, useState } from 'react';
import { MobileTopBar } from './MobileTopBar';
import { MobileBottomNav } from './MobileBottomNav';
import { ChatHistoryDrawer } from './ChatHistoryDrawer';
import { InstallPrompt } from './InstallPrompt';
import { useDeviceHeight } from '@/hooks/useDeviceHeight';

interface MobileAppContainerProps {
  children: ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const MobileAppContainer = ({
  children,
  activeSection,
  onSectionChange,
}: MobileAppContainerProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const deviceHeight = useDeviceHeight();
  const containerHeight = deviceHeight > 0 ? `${deviceHeight}px` : '100dvh';

  return (
    <div 
      className="relative flex flex-col bg-background overflow-hidden"
      style={{ 
        height: containerHeight,
        minHeight: '100vh'
      }}
    >
      {/* Top Bar */}
      <MobileTopBar 
        onMenuClick={() => setIsDrawerOpen(true)}
        activeSection={activeSection}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <MobileBottomNav 
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />

      {/* Chat History Drawer */}
      <ChatHistoryDrawer 
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />

      {/* Install Prompt */}
      <InstallPrompt />
    </div>
  );
};
