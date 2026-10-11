
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface UserPermission {
  id: string;
  user_id: string;
  permission_name: string;
  granted: boolean;
}

export const usePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPermissions();
      loadUserPermissions();
    }
  }, [user]);

  const loadPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('category, name');

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  };

  const loadUserPermissions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserPermissions(data || []);
    } catch (error) {
      console.error('Error loading user permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permissionName: string): boolean => {
    return userPermissions.some(
      up => up.permission_name === permissionName && up.granted
    );
  };

  const updateUserPermission = async (userId: string, permissionName: string, granted: boolean) => {
    try {
      const { error } = await supabase
        .from('user_permissions')
        .upsert({
          user_id: userId,
          permission_name: permissionName,
          granted,
          granted_by: user?.id,
          granted_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,permission_name',
          ignoreDuplicates: false
        });

      if (error) throw error;
      loadUserPermissions();
      return true;
    } catch (error) {
      console.error('Error updating user permission:', error);
      return false;
    }
  };

  return {
    permissions,
    userPermissions,
    loading,
    hasPermission,
    updateUserPermission,
    loadPermissions,
    loadUserPermissions
  };
};
