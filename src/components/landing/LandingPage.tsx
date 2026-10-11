import { LandingHero } from './LandingHero';
import { ServiceCards } from './ServiceCards';
import { useAppPermissions } from '@/contexts/AppPermissionsContext';
import { useAuth } from '@/hooks/useAuth';
import { Info } from 'lucide-react';

interface LandingPageProps {
  onNavigateToChat: () => void;
}

export const LandingPage = ({ onNavigateToChat }: LandingPageProps) => {
  const { guestChatAllowed } = useAppPermissions();
  const { user } = useAuth();

  const handleStartChat = () => {
    if (!guestChatAllowed && !user) {
      window.location.href = '/auth';
    } else {
      onNavigateToChat();
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <LandingHero onStartChat={handleStartChat} />

      {/* Guest mode banner */}
      {!user && guestChatAllowed && (
        <div className="sticky top-0 z-30 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-4 shadow-lg">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">
                You're in <strong>Guest Mode</strong> • Sign up to save your conversations
              </p>
            </div>
            <a 
              href="/auth" 
              className="text-xs font-semibold bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-full transition-colors whitespace-nowrap"
            >
              Sign Up
            </a>
          </div>
        </div>
      )}

      {/* Service Cards */}
      <ServiceCards />
    </div>
  );
};
