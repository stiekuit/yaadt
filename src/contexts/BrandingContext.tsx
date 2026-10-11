
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BrandingContextType {
  siteName: string;
  logoUrl: string | null;
  logoPlacement: string;
  logoSize: string;
  logoCustomWidth: number | null;
  logoCustomHeight: number | null;
  landingPageStyle: string;
  showSiteNameOnLanding: boolean;
  landingBackgroundColor: string;
  yaadtFooterEnabled: boolean;
  updateSiteName: (name: string) => Promise<boolean>;
  updateLogo: (file: File) => Promise<boolean>;
  updateLogoPlacement: (placement: string) => Promise<boolean>;
  updateLogoSize: (size: string, customWidth?: number, customHeight?: number) => Promise<boolean>;
  updateLandingPageStyle: (style: string) => Promise<boolean>;
  updateShowSiteNameOnLanding: (show: boolean) => Promise<boolean>;
  updateLandingBackgroundColor: (color: string) => Promise<boolean>;
  updateYaadtFooterEnabled: (enabled: boolean) => Promise<boolean>;
  loading: boolean;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

interface BrandingProviderProps {
  children: ReactNode;
}

export const BrandingProvider = ({ children }: BrandingProviderProps) => {
  const [siteName, setSiteName] = useState('Support Portal');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPlacement, setLogoPlacement] = useState('top-center');
  const [logoSize, setLogoSize] = useState('medium');
  const [logoCustomWidth, setLogoCustomWidth] = useState<number | null>(null);
  const [logoCustomHeight, setLogoCustomHeight] = useState<number | null>(null);
  const [landingPageStyle, setLandingPageStyle] = useState('minimal');
  const [showSiteNameOnLanding, setShowSiteNameOnLanding] = useState(true);
  const [landingBackgroundColor, setLandingBackgroundColor] = useState('#f9fafb');
  const [yaadtFooterEnabled, setYaadtFooterEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [recordId, setRecordId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadBranding();
  }, []);

  useEffect(() => {
    // Update document title based on site name
    document.title = `${siteName} - Support Portal`;
  }, [siteName]);

  useEffect(() => {
    // Update favicon when logo changes
    if (logoUrl) {
      updateFavicon(logoUrl);
    }
  }, [logoUrl]);

  const updateFavicon = (url: string) => {
    // Remove existing favicon links
    const existingLinks = document.querySelectorAll('link[rel*="icon"]');
    existingLinks.forEach(link => link.remove());

    // Add new favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = url;
    link.type = 'image/png';
    document.head.appendChild(link);
  };


  const loadBranding = async () => {
    try {
      const { data, error } = await supabase
        .from('site_branding')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setRecordId(data.id);
        setSiteName(data.site_name || 'Support Portal');
        setLogoUrl(data.logo_url);
        setLogoPlacement(data.logo_placement || 'top-center');
        setLogoSize(data.logo_size || 'medium');
        setLogoCustomWidth(data.logo_custom_width);
        setLogoCustomHeight(data.logo_custom_height);
        setLandingPageStyle(data.landing_page_style || 'minimal');
        setShowSiteNameOnLanding(data.show_site_name_on_landing ?? true);
        setLandingBackgroundColor(data.landing_background_color || '#f9fafb');
        setYaadtFooterEnabled(data.yaadt_footer_enabled ?? true);
      } else {
        // No branding record exists, using defaults (should be created by migration)
        console.log('No branding record found, using defaults');
      }
    } catch (error: any) {
      console.error('Error loading branding:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSiteName = async (name: string): Promise<boolean> => {
    // Optimistic update
    const previousName = siteName;
    setSiteName(name);

    try {
      if (!recordId) {
        throw new Error('No branding record found');
      }

      const { error } = await supabase
        .from('site_branding')
        .update({ 
          site_name: name, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', recordId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Site name updated successfully",
      });
      return true;
    } catch (error: any) {
      // Rollback optimistic update on error
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
      if (!recordId) {
        throw new Error('No branding record found');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(fileName);

      // Optimistic update
      const previousUrl = logoUrl;
      setLogoUrl(publicUrl);

      const { error: updateError } = await supabase
        .from('site_branding')
        .update({ 
          logo_url: publicUrl, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', recordId);

      if (updateError) {
        // Rollback on error
        setLogoUrl(previousUrl);
        throw updateError;
      }

      toast({
        title: "Success",
        description: "Logo updated successfully",
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

  const updateBrandingRecord = async (updates: any) => {
    if (!recordId) {
      // Try to create a default record if none exists
      const { data: newRecord, error: createError } = await supabase
        .from('site_branding')
        .insert({
          site_name: 'Support Portal',
          logo_url: '/lovable-uploads/2aecadba-fc7d-4144-9630-81e227016a4a.png',
          logo_placement: 'top-center',
          logo_size: 'medium',
          landing_page_style: 'minimal',
          show_site_name_on_landing: true,
          yaadt_footer_enabled: true,
          landing_background_color: '#f9fafb',
          ...updates
        })
        .select()
        .single();

      if (createError) throw createError;
      setRecordId(newRecord.id);
      return;
    }

    const { error } = await supabase
      .from('site_branding')
      .update({ 
        ...updates,
        updated_at: new Date().toISOString() 
      })
      .eq('id', recordId);

    if (error) throw error;
  };

  const updateLogoPlacement = async (placement: string): Promise<boolean> => {
    try {
      setLogoPlacement(placement);
      await updateBrandingRecord({ logo_placement: placement });
      toast({
        title: "Success",
        description: "Logo placement updated successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error updating logo placement:', error);
      setLogoPlacement(logoPlacement);
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
      await updateBrandingRecord({ 
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
      setLogoSize(logoSize);
      setLogoCustomWidth(logoCustomWidth);
      setLogoCustomHeight(logoCustomHeight);
      toast({
        title: "Error",
        description: error.message || "Failed to update logo size",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateLandingPageStyle = async (style: string): Promise<boolean> => {
    try {
      setLandingPageStyle(style);
      await updateBrandingRecord({ landing_page_style: style });
      toast({
        title: "Success",
        description: "Landing page style updated successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error updating landing page style:', error);
      setLandingPageStyle(landingPageStyle);
      toast({
        title: "Error",
        description: error.message || "Failed to update landing page style",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateShowSiteNameOnLanding = async (show: boolean): Promise<boolean> => {
    try {
      setShowSiteNameOnLanding(show);
      await updateBrandingRecord({ show_site_name_on_landing: show });
      toast({
        title: "Success",
        description: `Site name on landing ${show ? 'enabled' : 'disabled'} successfully`,
      });
      return true;
    } catch (error: any) {
      console.error('Error updating show site name on landing:', error);
      setShowSiteNameOnLanding(showSiteNameOnLanding);
      toast({
        title: "Error",
        description: error.message || "Failed to update site name visibility",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateLandingBackgroundColor = async (color: string): Promise<boolean> => {
    try {
      setLandingBackgroundColor(color);
      await updateBrandingRecord({ landing_background_color: color });
      toast({
        title: "Success",
        description: "Background color updated successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error updating landing background color:', error);
      setLandingBackgroundColor(landingBackgroundColor);
      toast({
        title: "Error",
        description: error.message || "Failed to update background color",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateYaadtFooterEnabled = async (enabled: boolean): Promise<boolean> => {
    try {
      setYaadtFooterEnabled(enabled);
      await updateBrandingRecord({ yaadt_footer_enabled: enabled });
      toast({
        title: "Success",
        description: `YAADT footer ${enabled ? 'enabled' : 'disabled'} successfully`,
      });
      return true;
    } catch (error: any) {
      console.error('Error updating yaadt footer enabled:', error);
      setYaadtFooterEnabled(yaadtFooterEnabled);
      toast({
        title: "Error",
        description: error.message || "Failed to update YAADT footer setting",
        variant: "destructive",
      });
      return false;
    }
  };

  const value: BrandingContextType = {
    siteName,
    logoUrl,
    logoPlacement,
    logoSize,
    logoCustomWidth,
    logoCustomHeight,
    landingPageStyle,
    showSiteNameOnLanding,
    landingBackgroundColor,
    yaadtFooterEnabled,
    updateSiteName,
    updateLogo,
    updateLogoPlacement,
    updateLogoSize,
    updateLandingPageStyle,
    updateShowSiteNameOnLanding,
    updateLandingBackgroundColor,
    updateYaadtFooterEnabled,
    loading,
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = (): BrandingContextType => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};
