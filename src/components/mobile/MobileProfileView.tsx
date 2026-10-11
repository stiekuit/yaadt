import { useState, useRef } from 'react';
import { Camera, User, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export const MobileProfileView = () => {
  const { profile, user, signOut } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    linkedin_url: profile?.linkedin_url || '',
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(profile?.profile_picture_url || '');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const validateFile = (file: File): string | null => {
    if (file.size > 2 * 1024 * 1024) {
      return 'File size must be less than 2MB';
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return 'File must be a JPG, PNG, or GIF image';
    }

    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: "Invalid File",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    if (!user) return;

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfileImageUrl(publicUrl);
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl('');
      }

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });

    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl('');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          linkedin_url: formData.linkedin_url,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const currentImageUrl = previewUrl || profileImageUrl || profile?.profile_picture_url;

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-xl font-bold">Profile</h1>
            <p className="text-sm text-muted-foreground">Manage your personal information</p>
          </div>

          {/* Profile Picture */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Profile Picture</h2>
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-32 h-32">
                <AvatarImage 
                  src={currentImageUrl} 
                  alt="Profile picture"
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl">
                  {profile?.full_name?.split(' ').map(n => n[0]).join('') || 
                   profile?.email?.slice(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="h-12 w-full"
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 mr-2" />
                )}
                {uploading ? 'Uploading...' : 'Change Picture'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground text-center">
                JPG, PNG or GIF • Max 2MB
              </p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Personal Information</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="h-12 bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter your full name"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
                <Input
                  id="linkedin_url"
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="h-12"
                />
              </div>

              <Button type="submit" disabled={saving} className="w-full h-12">
                {saving ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <User className="w-5 h-5 mr-2" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </div>

          {/* Sign Out Section */}
          <div className="bg-card border border-destructive/20 rounded-xl p-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full h-12">
                  <LogOut className="w-5 h-5 mr-2" />
                  Sign Out
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to sign out of your account?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={signOut} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Sign Out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
};
