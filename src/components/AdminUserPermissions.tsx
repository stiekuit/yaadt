import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserWithPermissions {
  id: string;
  email: string;
  full_name: string;
  role: string;
  permissions: Record<string, boolean>;
}

const AdminUserPermissions = () => {
  const { userRole } = useAuth();
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const [loading, setLoading] = useState(true);

  const featurePermissions = [
    { name: 'support_chat_access', label: 'Support Chat Access', description: 'Access to support chat functionality' },
    { name: 'general_chat_access', label: 'General Chat Access', description: 'Access to general chat functionality' },
    { name: 'tickets_access', label: 'Tickets Access', description: 'Access to tickets management' },
    { name: 'settings_access', label: 'Settings Access', description: 'Access to settings and administration' },
  ];

  useEffect(() => {
    if (userRole === 'admin') {
      loadUsersWithPermissions();
    }
  }, [userRole]);

  const loadUsersWithPermissions = async () => {
    try {
      setLoading(true);
      
      // Load users with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          user_roles!inner(role)
        `);

      if (profilesError) throw profilesError;

      // Load all user permissions
      const { data: userPermissions, error: permissionsError } = await supabase
        .from('user_permissions')
        .select('user_id, permission_name, granted')
        .in('permission_name', featurePermissions.map(p => p.name));

      if (permissionsError) throw permissionsError;

      // Combine data
      const usersWithPermissions = profiles?.map(profile => {
        const userPerms = userPermissions?.filter(up => up.user_id === profile.id) || [];
        const permissions = featurePermissions.reduce((acc, perm) => {
          const userPerm = userPerms.find(up => up.permission_name === perm.name);
          acc[perm.name] = userPerm?.granted || false;
          return acc;
        }, {} as Record<string, boolean>);

        return {
          id: profile.id,
          email: profile.email || '',
          full_name: profile.full_name || '',
          role: profile.user_roles?.[0]?.role || 'user',
          permissions,
        };
      }) || [];

      setUsers(usersWithPermissions);
    } catch (error) {
      console.error('Error loading users with permissions:', error);
      toast.error('Failed to load user permissions');
    } finally {
      setLoading(false);
    }
  };

  const updateUserPermission = async (userId: string, permissionName: string, granted: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('user_permissions')
        .upsert({
          user_id: userId,
          permission_name: permissionName,
          granted,
          granted_by: user?.id || null,
          granted_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,permission_name',
          ignoreDuplicates: false
        });

      if (error) throw error;

      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, permissions: { ...user.permissions, [permissionName]: granted } }
          : user
      ));

      toast.success(`Permission ${granted ? 'granted' : 'revoked'} successfully`);
    } catch (error) {
      console.error('Error updating permission:', error);
      toast.error('Failed to update permission');
    }
  };

  if (userRole !== 'admin') {
    return null;
  }

  if (loading) {
    return <div className="p-4">Loading user permissions...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">User Permissions Management</h2>
      
      <div className="grid gap-4">
        {users.map(user => (
          <Card key={user.id} className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{user.full_name || user.email}</h3>
              <p className="text-sm text-muted-foreground">
                {user.email} • Role: {user.role}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {featurePermissions.map(permission => (
                <div key={permission.name} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${user.id}-${permission.name}`}
                    checked={user.permissions[permission.name]}
                    onCheckedChange={(checked) => 
                      updateUserPermission(user.id, permission.name, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`${user.id}-${permission.name}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {permission.label}
                  </Label>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminUserPermissions;