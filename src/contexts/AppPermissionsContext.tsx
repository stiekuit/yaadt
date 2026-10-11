import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AppPermission {
  permission_key: string;
  permission_value: boolean;
  description?: string;
}

interface AppPermissionsContextType {
  permissions: Record<string, boolean>;
  loading: boolean;
  updatePermission: (key: string, value: boolean) => Promise<boolean>;
  guestChatAllowed: boolean;
  guestTicketsAllowed: boolean;
  guestGeneralChatAllowed: boolean;
}

const AppPermissionsContext = createContext<AppPermissionsContextType | undefined>(undefined);

export const useAppPermissions = (): AppPermissionsContextType => {
  const context = useContext(AppPermissionsContext);
  if (!context) {
    throw new Error('useAppPermissions must be used within AppPermissionsProvider');
  }
  return context;
};

interface AppPermissionsProviderProps {
  children: ReactNode;
}

export const AppPermissionsProvider = ({ children }: AppPermissionsProviderProps) => {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    guest_chat_access: true,
    guest_ticket_access: false,
    guest_general_chat_access: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPermissions();

    // SINGLE subscription for the entire app
    const subscription = supabase
      .channel('app_permissions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_permissions' },
        () => {
          loadPermissions();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - subscribes once on mount

  const loadPermissions = async () => {
    try {
      console.log('🔐 Loading app permissions...');
      const { data, error } = await supabase
        .from('app_permissions')
        .select('permission_key, permission_value');

      if (error) {
        console.error('❌ Error loading permissions:', error);
        throw error;
      }

      console.log('✅ Permissions loaded:', data);

      const permissionsMap: Record<string, boolean> = {
        guest_chat_access: true, // Default fallback
        guest_ticket_access: false,
        guest_general_chat_access: false,
      };
      
      data?.forEach((perm: AppPermission) => {
        permissionsMap[perm.permission_key] = perm.permission_value;
      });

      setPermissions(permissionsMap);
      console.log('✅ Permissions set:', permissionsMap);
    } catch (error) {
      console.error('❌ Error loading app permissions, using defaults:', error);
      // Keep default permissions (guest_chat_access: true)
    } finally {
      setLoading(false);
      console.log('✅ Permission loading complete');
    }
  };

  const updatePermission = async (key: string, value: boolean) => {
    try {
      const { error } = await supabase
        .from('app_permissions')
        .update({ permission_value: value, updated_at: new Date().toISOString() })
        .eq('permission_key', key);

      if (error) throw error;
      
      await loadPermissions();
      return true;
    } catch (error) {
      console.error('Error updating permission:', error);
      return false;
    }
  };

  const value: AppPermissionsContextType = {
    permissions,
    loading,
    updatePermission,
    guestChatAllowed: permissions.guest_chat_access,
    guestTicketsAllowed: permissions.guest_ticket_access,
    guestGeneralChatAllowed: permissions.guest_general_chat_access,
  };

  return (
    <AppPermissionsContext.Provider value={value}>
      {children}
    </AppPermissionsContext.Provider>
  );
};
