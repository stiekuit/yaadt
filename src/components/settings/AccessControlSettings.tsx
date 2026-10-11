import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAppPermissions } from '@/contexts/AppPermissionsContext';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

export const AccessControlSettings = () => {
  const { permissions, updatePermission, loading } = useAppPermissions();

  const handleToggle = async (key: string, value: boolean) => {
    const success = await updatePermission(key, value);
    if (success) {
      toast.success(`${key.replace(/_/g, ' ')} ${value ? 'enabled' : 'disabled'}`);
    } else {
      toast.error('Failed to update permission');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Guest Access Control</CardTitle>
          <CardDescription>
            Control which features are accessible to unauthenticated users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="guest-chat">Guest Support Chat Access</Label>
              <p className="text-sm text-muted-foreground">
                Allow unauthenticated users to access support chat (no history saved)
              </p>
            </div>
            <Switch
              id="guest-chat"
              checked={permissions.guest_chat_access}
              onCheckedChange={(checked) => handleToggle('guest_chat_access', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="guest-general">Guest General Chat Access</Label>
              <p className="text-sm text-muted-foreground">
                Allow unauthenticated users to access general chat
              </p>
            </div>
            <Switch
              id="guest-general"
              checked={permissions.guest_general_chat_access}
              onCheckedChange={(checked) => handleToggle('guest_general_chat_access', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="guest-tickets">Guest Ticket Access</Label>
              <p className="text-sm text-muted-foreground">
                ⚠️ Allow unauthenticated users to view/create tickets (advanced)
              </p>
            </div>
            <Switch
              id="guest-tickets"
              checked={permissions.guest_ticket_access}
              onCheckedChange={(checked) => handleToggle('guest_ticket_access', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-900 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Security Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-yellow-800 space-y-2 list-disc list-inside">
            <li>Guest users cannot access saved chat history</li>
            <li>Guest ticket access should only be enabled if you have public support needs</li>
            <li>Consider implementing rate limiting for guest users</li>
            <li>Guest data is not persistent across sessions</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
