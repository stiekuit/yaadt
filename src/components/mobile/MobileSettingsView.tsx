import { useState } from 'react';
import { 
  Bell, 
  Shield, 
  Webhook, 
  Globe, 
  Users, 
  Palette,
  Type,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import WebhookSettings from '@/components/settings/WebhookSettings';
import FreshdeskSettings from '@/components/settings/FreshdeskSettings';
import CategorySettings from '@/components/settings/CategorySettings';
import CustomerFieldSettings from '@/components/settings/CustomerFieldSettings';
import UserManagement from '@/components/UserManagement';
import BrandingSettings from '@/components/settings/BrandingSettings';

type SettingsSection = 'webhooks' | 'freshdesk' | 'categories' | 'customer-fields' | 'users' | 'branding' | null;

export const MobileSettingsView = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>(null);

  const sections = [
    { id: 'branding' as const, label: 'Branding', icon: Palette },
    { id: 'customer-fields' as const, label: 'Customer Fields', icon: Type },
    { id: 'webhooks' as const, label: 'Webhooks', icon: Webhook },
    { id: 'freshdesk' as const, label: 'Freshdesk', icon: Globe },
    { id: 'categories' as const, label: 'Categories', icon: Bell },
    { id: 'users' as const, label: 'User Management', icon: Users },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'branding':
        return <BrandingSettings />;
      case 'customer-fields':
        return <CustomerFieldSettings />;
      case 'webhooks':
        return <WebhookSettings />;
      case 'freshdesk':
        return <FreshdeskSettings />;
      case 'categories':
        return <CategorySettings />;
      case 'users':
        return <UserManagement />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div>
            <h1 className="text-xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">Configure system preferences</p>
          </div>

          {/* Settings Sections */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div key={section.id}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-accent transition-colors active:scale-[0.99]"
                    aria-label={`Open ${section.label} settings`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium">{section.label}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                  {index < sections.length - 1 && (
                    <div className="border-b border-border ml-16" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Settings Detail Sheet */}
      <Sheet open={!!activeSection} onOpenChange={(open) => !open && setActiveSection(null)}>
        <SheetContent side="bottom" className="h-[95vh] flex flex-col p-0">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-bold">
              {sections.find(s => s.id === activeSection)?.label}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveSection(null)}
            >
              Close
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {renderSectionContent()}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
