import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, UserPlus, Edit, Trash2, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { SupabaseService } from '@/services/supabaseService';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  user_roles: { role: string }[];
}

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

const UserManagement = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<Record<string, UserPermission[]>>({});
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserFullName, setNewUserFullName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('user');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadProfiles(),
      loadPermissions(),
      loadAllUserPermissions()
    ]);
  };

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            role
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      const data = await SupabaseService.loadAllPermissions();
      setPermissions(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load permissions",
        variant: "destructive",
      });
    }
  };

  const loadAllUserPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*');

      if (error) throw error;

      const permissionsByUser = (data || []).reduce((acc, perm) => {
        if (!acc[perm.user_id]) {
          acc[perm.user_id] = [];
        }
        acc[perm.user_id].push(perm);
        return acc;
      }, {} as Record<string, UserPermission[]>);

      setUserPermissions(permissionsByUser);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load user permissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate email format and length
      if (newUserEmail.length > 255) {
        throw new Error('Email must be less than 255 characters');
      }
      if (newUserFullName.length > 100) {
        throw new Error('Full name must be less than 100 characters');
      }
      if (newUserPassword.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUserEmail.trim().toLowerCase(),
        password: newUserPassword,
        user_metadata: {
          full_name: newUserFullName.trim(),
        },
        email_confirm: true,
      });

      if (authError) throw authError;

      // Update user role if admin
      if (newUserRole === 'admin' && authData.user) {
        await supabase
          .from('user_roles')
          .update({ role: 'admin' })
          .eq('user_id', authData.user.id);
      }

      toast({
        title: "Success",
        description: "User created successfully",
      });

      setIsCreateModalOpen(false);
      setNewUserEmail('');
      setNewUserFullName('');
      setNewUserPassword('');
      setNewUserRole('user');
      loadProfiles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !isActive })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${!isActive ? 'activated' : 'deactivated'} successfully`,
      });

      loadProfiles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated successfully",
      });

      loadProfiles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const openPermissionsModal = (userId: string) => {
    setSelectedUserId(userId);
    setIsPermissionsModalOpen(true);
  };

  const updatePermission = async (userId: string, permissionName: string, granted: boolean) => {
    try {
      const success = await SupabaseService.updateUserPermission(userId, permissionName, granted);
      
      if (success) {
        toast({
          title: "Success",
          description: "Permission updated successfully",
        });
        loadAllUserPermissions();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update permission",
        variant: "destructive",
      });
    }
  };

  const hasPermission = (userId: string, permissionName: string): boolean => {
    const userPerms = userPermissions[userId] || [];
    return userPerms.some(p => p.permission_name === permissionName && p.granted);
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading && profiles.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading users...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">User Management</h3>
          <p className="text-sm text-gray-500">Manage system users and their permissions</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system with specified role and permissions.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={newUserFullName}
                  onChange={(e) => setNewUserFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newUserRole} onValueChange={(value: 'admin' | 'user') => setNewUserRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  Create User
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {profiles.map((profile) => (
          <Card key={profile.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{profile.full_name}</h4>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                    <p className="text-xs text-gray-400">
                      Created: {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant={profile.user_roles[0]?.role === 'admin' ? 'default' : 'secondary'}>
                      {profile.user_roles[0]?.role || 'user'}
                    </Badge>
                    <Select
                      value={profile.user_roles[0]?.role || 'user'}
                      onValueChange={(value: 'admin' | 'user') => updateUserRole(profile.id, value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => openPermissionsModal(profile.id)}
                    variant="outline"
                    size="sm"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Permissions
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={profile.is_active}
                      onCheckedChange={() => toggleUserStatus(profile.id, profile.is_active)}
                    />
                    <span className="text-sm text-gray-500">
                      {profile.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permissions Modal */}
      <Dialog open={isPermissionsModalOpen} onOpenChange={setIsPermissionsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage User Permissions</DialogTitle>
            <DialogDescription>
              Configure permissions for {profiles.find(p => p.id === selectedUserId)?.full_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
              <div key={category} className="space-y-3">
                <h4 className="font-medium text-lg capitalize">{category}</h4>
                <div className="space-y-2 pl-4">
                  {categoryPermissions.map((permission) => (
                    <div key={permission.name} className="flex items-center space-x-3">
                      <Checkbox
                        id={permission.name}
                        checked={hasPermission(selectedUserId, permission.name)}
                        onCheckedChange={(checked) => 
                          updatePermission(selectedUserId, permission.name, checked as boolean)
                        }
                      />
                      <div className="flex-1">
                        <Label htmlFor={permission.name} className="text-sm font-medium">
                          {permission.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Label>
                        {permission.description && (
                          <p className="text-xs text-gray-500">{permission.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
