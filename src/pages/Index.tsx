import { useState, lazy, Suspense, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatInterface from '@/components/ChatInterface';
import YaadtFooter from '@/components/YaadtFooter';
import { ConfigProvider } from '@/contexts/ConfigContext';
import { AppBrandingProvider } from '@/contexts/AppBrandingContext';
import { useAuth } from '@/hooks/useAuth';
import { useMobileMode } from '@/hooks/useMobileMode';
import { useGuestMode } from '@/hooks/useGuestMode';
import { MobileAppContainer } from '@/components/mobile/MobileAppContainer';
import { MobileLoadingSkeleton } from '@/components/mobile/MobileLoadingSkeletons';

// Lazy load desktop components
const TicketsPanel = lazy(() => import('@/components/TicketsPanel'));
const SettingsPanel = lazy(() => import('@/components/SettingsPanel'));
const ProfileSettings = lazy(() => import('@/components/settings/ProfileSettings'));

// Lazy load mobile views
const MobileChatInterface = lazy(() => import('@/components/mobile/MobileChatInterface').then(m => ({ default: m.MobileChatInterface })));
const GuestChatInterface = lazy(() => import('@/components/mobile/GuestChatInterface').then(m => ({ default: m.GuestChatInterface })));
const MobileTicketsView = lazy(() => import('@/components/mobile/MobileTicketsView').then(m => ({ default: m.MobileTicketsView })));
const MobileProfileView = lazy(() => import('@/components/mobile/MobileProfileView').then(m => ({ default: m.MobileProfileView })));
const MobileSettingsView = lazy(() => import('@/components/mobile/MobileSettingsView').then(m => ({ default: m.MobileSettingsView })));
const LandingPage = lazy(() => import('@/components/landing/LandingPage').then(m => ({ default: m.LandingPage })));

const Index = () => {
  const { userRole, profile } = useAuth();
  const { isGuest } = useGuestMode();
  const { isMobileMode } = useMobileMode();
  const [activeSection, setActiveSection] = useState(isGuest ? 'landing' : 'chat');
  const isAdmin = userRole === 'admin' || profile?.email === 'romano.brooks@payment24.com';
  const prevIsGuestRef = useRef(isGuest);

  // Reset to landing page only when user logs out (transitions from authenticated to guest)
  useEffect(() => {
    if (!prevIsGuestRef.current && isGuest) {
      // User just logged out
      setActiveSection('landing');
    }
    prevIsGuestRef.current = isGuest;
  }, [isGuest]);

  const renderMainContent = () => {
    const content = (() => {
      switch (activeSection) {
        case 'landing':
          return <LandingPage onNavigateToChat={() => setActiveSection('chat')} />;
        case 'chat':
          return <ChatInterface />;
        case 'tickets':
          return <TicketsPanel />;
        case 'profile':
          return (
            <div className="bg-white rounded-lg border border-gray-200 h-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
                <p className="text-sm text-gray-500">Manage your personal information and preferences</p>
              </div>
              <div className="p-6">
                <ProfileSettings />
              </div>
            </div>
          );
        case 'settings':
          return isAdmin ? <SettingsPanel /> : <ChatInterface />;
        default:
          return <ChatInterface />;
      }
    })();

    return (
      <Suspense fallback={<MobileLoadingSkeleton />}>
        {content}
      </Suspense>
    );
  };

  const renderMobileContent = () => {
    const content = (() => {
      switch (activeSection) {
        case 'landing':
          return <LandingPage onNavigateToChat={() => setActiveSection('chat')} />;
        case 'chat':
          return isGuest ? <GuestChatInterface /> : <MobileChatInterface />;
        case 'tickets':
          return <MobileTicketsView />;
        case 'profile':
          return <MobileProfileView />;
        case 'settings':
          return isAdmin ? <MobileSettingsView /> : (isGuest ? <GuestChatInterface /> : <MobileChatInterface />);
        default:
          return isGuest ? <GuestChatInterface /> : <MobileChatInterface />;
      }
    })();

    return (
      <Suspense fallback={<MobileLoadingSkeleton />}>
        {content}
      </Suspense>
    );
  };

  return (
    <>
      {isMobileMode ? (
        <MobileAppContainer activeSection={activeSection} onSectionChange={setActiveSection}>
          {renderMobileContent()}
        </MobileAppContainer>
      ) : (
        <div className="min-h-screen bg-gray-50">
          <div className="flex h-screen">
            <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
            <main className="flex-1 p-6">
              <div className="h-full">
                {renderMainContent()}
              </div>
            </main>
          </div>
          <YaadtFooter />
        </div>
      )}
    </>
  );
};

export default Index;
