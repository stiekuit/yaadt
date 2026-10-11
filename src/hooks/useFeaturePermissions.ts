import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface FeaturePermissions {
  supportChatAccess: boolean;
  generalChatAccess: boolean;
  ticketsAccess: boolean;
  settingsAccess: boolean;
}

export const useFeaturePermissions = () => {
  const { user, userRole } = useAuth();
  const [permissions, setPermissions] = useState<FeaturePermissions>({
    supportChatAccess: false,
    generalChatAccess: false,
    ticketsAccess: false,
    settingsAccess: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserPermissions();
    } else {
      setPermissions({
        supportChatAccess: false,
        generalChatAccess: false,
        ticketsAccess: false,
        settingsAccess: false,
      });
      setLoading(false);
    }
  }, [user]);

  const loadUserPermissions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Admins get all permissions by default
      if (userRole === 'admin') {
        setPermissions({
          supportChatAccess: true,
          generalChatAccess: true,
          ticketsAccess: true,
          settingsAccess: true,
        });
        setLoading(false);
        return;
      }

      // Load user-specific permissions
      const { data: userPermissions, error } = await supabase
        .from('user_permissions')
        .select('permission_name, granted')
        .eq('user_id', user.id)
        .eq('granted', true);

      if (error) {
        console.error('Error loading user permissions:', error);
        setLoading(false);
        return;
      }

      const permissionMap = userPermissions?.reduce((acc, perm) => {
        acc[perm.permission_name] = perm.granted;
        return acc;
      }, {} as Record<string, boolean>) || {};

      setPermissions({
        supportChatAccess: permissionMap['support_chat_access'] || false,
        generalChatAccess: permissionMap['general_chat_access'] || false,
        ticketsAccess: permissionMap['tickets_access'] || false,
        settingsAccess: permissionMap['settings_access'] || false,
      });
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    permissions,
    loading,
    refresh: loadUserPermissions,
  };
};