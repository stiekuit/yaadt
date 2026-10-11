import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AppBrandingContextType {
  siteName: string;
  logoUrl: string | null;
  logoPlacement: string;
  logoSize: string;
  logoCustomWidth: number | null;
  logoCustomHeight: number | null;
  showSiteName: boolean;
  primaryColor: string;
  sidebarBgColor: string;
  headerBgColor: string;
  updateSiteName: (name: string) => Promise<boolean>;
  updateLogo: (file: File) => Promise<boolean>;
  updateLogoPlacement: (placement: string) => Promise<boolean>;
  updateLogoSize: (size: string, customWidth?: number, customHeight?: number) => Promise<boolean>;
  updateShowSiteName: (show: boolean) => Promise<boolean>;
  updatePrimaryColor: (color: string) => Promise<boolean>;
  loading: boolean;
}

const AppBrandingContext = createContext<AppBrandingContextType | undefined>(undefined);

interface AppBrandingProviderProps {
  children: ReactNode;
}

export const AppBrandingProvider = ({ children }: AppBrandingProviderProps) => {
  const [siteName, setSiteName] = useState('Support Portal');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPlacement, setLogoPlacement] = useState('top-left');
  const [logoSize, setLogoSize] = useState('medium');
  const [logoCustomWidth, setLogoCustomWidth] = useState<number | null>(null);
  const [logoCustomHeight, setLogoCustomHeight] = useState<number | null>(null);
  const [showSiteName, setShowSiteName] = useState(true);
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [sidebarBgColor, setSidebarBgColor] = useState('#ffffff');
  const [headerBgColor, setHeaderBgColor] = useState('#f9fafb');
  const [loading, setLoading] = useState(true);
  const [recordId, setRecordId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadAppBranding();
  }, []);

  const loadAppBranding = async () => {
    try {
      const { data, error } = await supabase
        .from('app_branding')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setRecordId(data.id);
        setSiteName(data.site_name || 'Support Portal');
        setLogoUrl(data.logo_url);
        setLogoPlacement(data.logo_placement || 'top-left');
        setLogoSize(data.logo_size || 'medium');
        setLogoCustomWidth(data.logo_custom_width);
        setLogoCustomHeight(data.logo_custom_height);
        setShowSiteName(data.show_site_name ?? true);
        setPrimaryColor(data.primary_color || '#3b82f6');
        setSidebarBgColor(data.sidebar_bg_color || '#ffffff');
        setHeaderBgColor(data.header_bg_color || '#f9fafb');
      }
    } catch (error: any) {
      console.error('Error loading app branding:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppBrandingRecord = async (updates: any) => {
    if (!recordId) {
      throw new Error('No app branding record found');
    }

    const { error } = await supabase
      .from('app_branding')
      .update({ 
        ...updates,
        updated_at: new Date().toISOString() 
      })
      .eq('id', recordId);

    if (error) throw error;
  };

  const updateSiteName = async (name: string): Promise<boolean> => {
    const previousName = siteName;
    setSiteName(name);

    try {
      await updateAppBrandingRecord({ site_name: name });
      toast({
        title: "Success",
        description: "App site name updated successfully",
      });
      return true;
    } catch (error: any) {
      setSiteName(previousName);
      console.error('Error updating site name:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update site name",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateLogo = async (file: File): Promise<boolean> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `app-logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(fileName);

      const previousUrl = logoUrl;
      setLogoUrl(publicUrl);

      await updateAppBrandingRecord({ logo_url: publicUrl });

      toast({
        title: "Success",
        description: "App logo updated successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error updating logo:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update logo",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateLogoPlacement = async (placement: string): Promise<boolean> => {
    try {
      setLogoPlacement(placement);
      await updateAppBrandingRecord({ logo_placement: placement });
      toast({
        title: "Success",
        description: "Logo placement updated successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error updating logo placement:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update logo placement",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateLogoSize = async (size: string, customWidth?: number, customHeight?: number): Promise<boolean> => {
    try {
      setLogoSize(size);
      setLogoCustomWidth(customWidth || null);
      setLogoCustomHeight(customHeight || null);
      await updateAppBrandingRecord({ 
        logo_size: size,
        logo_custom_width: customWidth || null,
        logo_custom_height: customHeight || null
      });
      toast({
        title: "Success",
        description: "Logo size updated successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error updating logo size:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update logo size",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateShowSiteName = async (show: boolean): Promise<boolean> => {
    try {
      setShowSiteName(show);
      await updateAppBrandingRecord({ show_site_name: show });
      toast({
        title: "Success",
        description: `Site name visibility updated successfully`,
      });
      return true;
    } catch (error: any) {
      console.error('Error updating show site name:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update site name visibility",
        variant: "destructive",
      });
      return false;
    }
  };

  const updatePrimaryColor = async (color: string): Promise<boolean> => {
    try {
      setPrimaryColor(color);
      await updateAppBrandingRecord({ primary_color: color });
      toast({
        title: "Success",
        description: "Primary color updated successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error updating primary color:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update primary color",
        variant: "destructive",
      });
      return false;
    }
  };

  const value: AppBrandingContextType = {
    siteName,
    logoUrl,
    logoPlacement,
    logoSize,
    logoCustomWidth,
    logoCustomHeight,
    showSiteName,
    primaryColor,
    sidebarBgColor,
    headerBgColor,
    updateSiteName,
    updateLogo,
    updateLogoPlacement,
    updateLogoSize,
    updateShowSiteName,
    updatePrimaryColor,
    loading,
  };

  return (
    <AppBrandingContext.Provider value={value}>
      {children}
    </AppBrandingContext.Provider>
  );
};

export const useAppBranding = (): AppBrandingContextType => {
  const context = useContext(AppBrandingContext);
  if (!context) {
    throw new Error('useAppBranding must be used within an AppBrandingProvider');
  }
  return context;
};
