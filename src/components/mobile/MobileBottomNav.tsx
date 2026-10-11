import { MessageSquare, Ticket, User, Settings, LogIn, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useFeaturePermissions } from '@/hooks/useFeaturePermissions';
import { useAuth } from '@/hooks/useAuth';
import { useGuestMode } from '@/hooks/useGuestMode';
import { useAppPermissions } from '@/contexts/AppPermissionsContext';

interface MobileBottomNavProps {
  onSectionChange: (section: string) => void;
  activeSection: string;
}

export const MobileBottomNav = ({ onSectionChange, activeSection }: MobileBottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const permissions = useFeaturePermissions();
  const { userRole, profile } = useAuth();
  const { isGuest } = useGuestMode();
  const { guestChatAllowed, guestTicketsAllowed } = useAppPermissions();
  const isAdmin = userRole === 'admin' || profile?.email === 'romano.brooks@payment24.com';

  const navItems = isGuest
    ? [
        {
          id: 'landing',
          label: 'Home',
          icon: Home,
          show: true,
        },
        ...(guestChatAllowed
          ? [
              {
                id: 'chat',
                label: 'Chat',
                icon: MessageSquare,
                show: true,
              },
            ]
          : []),
        ...(guestTicketsAllowed
          ? [
              {
                id: 'tickets',
                label: 'Tickets',
                icon: Ticket,
                show: true,
              },
            ]
          : []),
        {
          id: 'signin',
          label: 'Sign In',
          icon: LogIn,
          show: true,
          action: () => navigate('/auth'),
        },
      ].filter((item) => item.show)
    : [
        {
          id: 'chat',
          label: 'Chat',
          icon: MessageSquare,
          show: permissions.permissions.supportChatAccess || permissions.permissions.generalChatAccess,
        },
        {
          id: 'tickets',
          label: 'Tickets',
          icon: Ticket,
          show: permissions.permissions.ticketsAccess,
        },
        {
          id: 'profile',
          label: 'Profile',
          icon: User,
          show: true,
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
          show: isAdmin,
        },
      ].filter((item) => item.show);

  const handleNavClick = (itemId: string, action?: () => void) => {
    if (action) {
      action();
    } else {
      onSectionChange(itemId);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-bottom" role="navigation" aria-label="Main navigation">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id, (item as any).action)}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full gap-1.5 transition-all min-touch-target touch-feedback",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-6 h-6" />
              <span className={cn(
                "text-xs transition-all",
                isActive ? "font-bold" : "font-medium"
              )}>
                {item.label}
              </span>
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
