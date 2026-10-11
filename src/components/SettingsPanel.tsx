import { Bell, Shield, Globe, Palette, Webhook, Users, Type, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WebhookSettings from '@/components/settings/WebhookSettings';
import FreshdeskSettings from '@/components/settings/FreshdeskSettings';
import CategorySettings from '@/components/settings/CategorySettings';
import CustomerFieldSettings from '@/components/settings/CustomerFieldSettings';
import UserManagement from '@/components/UserManagement';
import { LanguageDialog, TimezoneDialog, ThemeDialog } from '@/components/settings/SettingsDialogs';
import BrandingSettings from '@/components/settings/BrandingSettings';
import AdminUserPermissions from '@/components/AdminUserPermissions';
import { MonitoringDashboard } from '@/components/monitoring/MonitoringDashboard';
import { AccessControlSettings } from '@/components/settings/AccessControlSettings';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/contexts/SettingsContext';
import { useState } from 'react';

const SettingsPanel = () => {
  const { profile, userRole } = useAuth();
  const {
    newTicketAlerts,
    chatMessages,
    sessionTimeout,
    language,
    timezone,
    theme,
    updateNotificationSettings,
    updateSecuritySettings,
    updatePreferenceSettings,
    openTwoFactorConfig,
  } = useSettings();

  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [timezoneDialogOpen, setTimezoneDialogOpen] = useState(false);
  const [themeDialogOpen, setThemeDialogOpen] = useState(false);

  const isAdmin = userRole === 'admin' || profile?.email === 'romano.brooks@payment24.com';

  // Only render if user is admin
  if (!isAdmin) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-sm text-gray-500">You don't have permission to access this section.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 h-full">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Administration Settings</h2>
        <p className="text-sm text-gray-500">Configure system-wide settings and preferences</p>
      </div>

      <div className="p-6">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-10">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="customer-fields">Customer Fields</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="freshdesk">Freshdesk</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="access-control">Access Control</TabsTrigger>
            <TabsTrigger value="monitoring">
              <Activity className="h-4 w-4 mr-2" />
              Monitoring
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-900 flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </h3>
              <div className="space-y-3 pl-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">New ticket alerts</p>
                    <p className="text-xs text-gray-500">Get notified when new tickets are created</p>
                  </div>
                  <Switch 
                    checked={newTicketAlerts}
                    onCheckedChange={(checked) => updateNotificationSettings(checked, chatMessages)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Chat messages</p>
                    <p className="text-xs text-gray-500">Receive alerts for new chat messages</p>
                  </div>
                  <Switch 
                    checked={chatMessages}
                    onCheckedChange={(checked) => updateNotificationSettings(newTicketAlerts, checked)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-900 flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Security</span>
              </h3>
              <div className="space-y-3 pl-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Two-factor authentication</p>
                    <p className="text-xs text-gray-500">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={openTwoFactorConfig}>Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Session timeout</p>
                    <p className="text-xs text-gray-500">Automatically log out after inactivity</p>
                  </div>
                  <Switch 
                    checked={sessionTimeout}
                    onCheckedChange={updateSecuritySettings}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-900 flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Preferences</span>
              </h3>
              <div className="space-y-3 pl-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Language</p>
                    <p className="text-xs text-gray-500">Choose your preferred language</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setLanguageDialogOpen(true)}>
                    {language}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Time zone</p>
                    <p className="text-xs text-gray-500">Set your local time zone</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setTimezoneDialogOpen(true)}>
                    {timezone}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-900 flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Appearance</span>
              </h3>
              <div className="space-y-3 pl-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Theme</p>
                    <p className="text-xs text-gray-500">Choose between light and dark mode</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setThemeDialogOpen(true)}>
                    {theme === 'light' ? 'Light' : 'Dark'}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="branding">
            <BrandingSettings />
          </TabsContent>

          <TabsContent value="customer-fields">
            <CustomerFieldSettings />
          </TabsContent>

          <TabsContent value="webhooks">
            <WebhookSettings />
          </TabsContent>

          <TabsContent value="freshdesk">
            <FreshdeskSettings />
          </TabsContent>

          <TabsContent value="categories">
            <CategorySettings />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="permissions">
            <AdminUserPermissions />
          </TabsContent>

          <TabsContent value="access-control">
            <AccessControlSettings />
          </TabsContent>

          <TabsContent value="monitoring">
            <MonitoringDashboard />
          </TabsContent>
        </Tabs>
      </div>

      {/* Settings Dialogs */}
      <LanguageDialog
        isOpen={languageDialogOpen}
        onClose={() => setLanguageDialogOpen(false)}
        currentLanguage={language}
        onLanguageChange={(newLanguage) => updatePreferenceSettings(newLanguage, timezone, theme)}
      />

      <TimezoneDialog
        isOpen={timezoneDialogOpen}
        onClose={() => setTimezoneDialogOpen(false)}
        currentTimezone={timezone}
        onTimezoneChange={(newTimezone) => updatePreferenceSettings(language, newTimezone, theme)}
      />

      <ThemeDialog
        isOpen={themeDialogOpen}
        onClose={() => setThemeDialogOpen(false)}
        currentTheme={theme}
        onThemeChange={(newTheme) => updatePreferenceSettings(language, timezone, newTheme)}
      />
    </div>
  );
};

export default SettingsPanel;
