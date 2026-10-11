
import React, { useState, useRef } from 'react';
import { User, Camera, Upload, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ProfileSettings = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    linkedin_url: profile?.linkedin_url || '',
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(profile?.profile_picture_url || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const validateFile = (file: File): string | null => {
    // Check file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      return 'File size must be less than 2MB';
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return 'File must be a JPG, PNG, or GIF image';
    }

    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File selected:', file.name, file.size, file.type);

    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: "Invalid File",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Automatically start upload
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    if (!user) {
      console.error('No user found');
      return;
    }

    setUploading(true);
    console.log('Starting upload for user:', user.id);

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      console.log('Uploading to path:', fileName);

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      console.log('Public URL generated:', publicUrl);

      // Update the profile in the database
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: publicUrl })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Database update error:', updateError);
        throw updateError;
      }

      console.log('Profile updated successfully:', updateData);

      // Update local state immediately
      setProfileImageUrl(publicUrl);
      
      // Clean up preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl('');
      }

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });

    } catch (error: any) {
      console.error('Error in uploadFile:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
      
      // Clean up preview URL on error
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl('');
      }
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    console.log('Saving profile data:', formData);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          linkedin_url: formData.linkedin_url,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Profile save error:', error);
        throw error;
      }

      console.log('Profile saved successfully');

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

    } catch (error: any) {
      console.error('Error in handleSaveProfile:', error);
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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Profile Settings</h3>
        <p className="text-sm text-gray-500">Manage your personal information and profile picture</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Update your profile picture (JPG, PNG, or GIF, max 2MB)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage 
                src={currentImageUrl} 
                alt="Profile picture"
                className="object-cover"
              />
              <AvatarFallback className="text-lg">
                {profile?.full_name?.split(' ').map(n => n[0]).join('') || 
                 profile?.email?.slice(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 mr-2" />
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
              {selectedFile && !uploading && (
                <p className="text-xs text-green-600">
                  Selected: {selectedFile.name}
                </p>
              )}
              {uploading && (
                <p className="text-xs text-blue-600">
                  Uploading your new profile picture...
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ''}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Enter your full name"
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
              />
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <User className="w-4 h-4 mr-2" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
