
import { MessageCircle, Ticket, Settings, User, LogOut, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useBranding } from '@/contexts/BrandingContext';
import { useConfig } from '@/contexts/ConfigContext';
import { useFeaturePermissions } from '@/hooks/useFeaturePermissions';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
  const { profile, userRole, signOut } = useAuth();
  const { siteName, logoUrl } = useBranding();
  const { currentChatType, setCurrentChatType } = useConfig();
  const { permissions, loading } = useFeaturePermissions();

  // Build menu items based on user permissions
  const menuItems = [
    ...(permissions.supportChatAccess ? [{ id: 'support-chat', label: 'Support Chat', icon: MessageCircle, chatType: 'support' }] : []),
    ...(permissions.generalChatAccess ? [{ id: 'general-chat', label: 'General Chat', icon: MessageSquare, chatType: 'general' }] : []),
    ...(permissions.ticketsAccess ? [{ id: 'tickets', label: 'Tickets', icon: Ticket }] : []),
    ...(permissions.settingsAccess ? [{ id: 'settings', label: 'Settings', icon: Settings }] : [])
  ];

  const handleMenuClick = (id: string) => {
    if (id === 'support-chat') setCurrentChatType('support');
    if (id === 'general-chat') setCurrentChatType('general');
    onSectionChange(id === 'support-chat' || id === 'general-chat' ? 'chat' : id);
  };

  // Show loading skeleton
  if (loading) {
    return (
      <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="h-10 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="p-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-200 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  // Show guest sidebar for unauthenticated users
  if (!profile) {
    return (
      <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt="Site Logo" 
                className="w-10 h-10 object-contain"
              />
            )}
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{siteName}</h1>
              <p className="text-sm text-gray-500">Help Center</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => onSectionChange('chat')}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
                  activeSection === 'chat'
                    ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">Support Chat</span>
              </button>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Button onClick={() => window.location.href = '/auth'} className="w-full">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          {logoUrl && (
            <img 
              src={logoUrl} 
              alt="Site Logo" 
              className="w-10 h-10 object-contain"
            />
          )}
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{siteName}</h1>
            <p className="text-sm text-gray-500">Help Center</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleMenuClick(item.id)}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
                  (activeSection === 'chat' && (
                    (item.id === 'support-chat' && currentChatType === 'support') ||
                    (item.id === 'general-chat' && currentChatType === 'general')
                  )) ||
                  activeSection === item.id
                    ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200 space-y-3">
        <button
          onClick={() => onSectionChange('profile')}
          className={cn(
            "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
            activeSection === 'profile'
              ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {profile?.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-500 capitalize">{userRole}</p>
          </div>
        </button>
        
        <Button
          onClick={signOut}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
