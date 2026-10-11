import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';

type MobilePreference = 'auto' | 'mobile' | 'desktop';

export const useMobileMode = () => {
  const deviceIsMobile = useIsMobile();
  const { user } = useAuth();
  const [preference, setPreference] = useState<MobilePreference>('auto');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreference();
  }, [user]);

  const loadPreference = async () => {
    if (!user) {
      setPreference('auto');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('mobile_mode_preference')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setPreference((data.mobile_mode_preference as MobilePreference) || 'auto');
      }
    } catch (error) {
      console.error('Error loading mobile preference:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (newPreference: MobilePreference) => {
    if (!user) return false;

    setPreference(newPreference);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ mobile_mode_preference: newPreference })
        .eq('id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating mobile preference:', error);
      return false;
    }
  };

  const toggleMobileMode = async () => {
    let newPreference: MobilePreference;
    
    if (preference === 'auto') {
      newPreference = deviceIsMobile ? 'desktop' : 'mobile';
    } else if (preference === 'mobile') {
      newPreference = 'desktop';
    } else {
      newPreference = 'auto';
    }

    return await updatePreference(newPreference);
  };

  // Determine if mobile mode should be active
  const isMobileMode = preference === 'mobile' || (preference === 'auto' && deviceIsMobile);

  return {
    isMobileMode,
    preference,
    deviceIsMobile,
    toggleMobileMode,
    updatePreference,
    loading,
  };
};
