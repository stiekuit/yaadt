import { Menu, Zap, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useConfig } from '@/contexts/ConfigContext';
import { useAppBranding } from '@/contexts/AppBrandingContext';
import { cn } from '@/lib/utils';

interface MobileTopBarProps {
  onMenuClick: () => void;
  activeSection: string;
}

export const MobileTopBar = ({ onMenuClick, activeSection }: MobileTopBarProps) => {
  const { activeWebhook, currentChatType } = useConfig();
  const { siteName, logoUrl } = useAppBranding();
  
  const getSectionTitle = () => {
    switch (activeSection) {
      case 'landing':
        return null; // Will show logo instead
      case 'chat':
        return currentChatType === 'support' ? 'Support Chat' : 'General Chat';
      case 'tickets':
        return 'Tickets';
      case 'profile':
        return 'Profile';
      case 'settings':
        return 'Settings';
      default:
        return siteName || 'YAADT';
    }
  };

  const sectionTitle = getSectionTitle();

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border safe-top" role="banner">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left: Menu Button (only show for chat section) */}
        <div className="flex items-center gap-2">
          {activeSection === 'chat' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="min-touch-target touch-feedback"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}
        </div>

        {/* Center: Title or Logo */}
        <div className="flex-1 flex items-center justify-center">
          {activeSection === 'landing' ? (
            logoUrl ? (
              <img src={logoUrl} alt={siteName} className="h-8 w-auto max-w-[200px] object-contain" />
            ) : (
              <div className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                  {siteName || 'YAADT'}
                </span>
              </div>
            )
          ) : (
            <h1 className="text-lg font-semibold text-foreground truncate">
              {sectionTitle}
            </h1>
          )}
        </div>

        {/* Right: Connection Status */}
        <div className="flex items-center gap-2">
          {activeSection === 'chat' && activeWebhook && (
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs gap-1.5 safe-right",
                "bg-primary/10 text-primary border-primary/20"
              )}
              role="status"
              aria-label="Webhook connected"
            >
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              <Zap className="w-3 h-3" />
            </Badge>
          )}
        </div>
      </div>
    </header>
  );
};
