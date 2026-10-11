import { Bug, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { MonitoringMode } from '@/types/monitoring';

interface MonitoringModeToggleProps {
  mode: MonitoringMode;
  onModeChange: (mode: MonitoringMode) => void;
  canUseDebug: boolean;
}

export const MonitoringModeToggle = ({ mode, onModeChange, canUseDebug }: MonitoringModeToggleProps) => {
  const { user } = useAuth();

  const handleModeChange = async (newMode: MonitoringMode) => {
    if (newMode === 'debug' && !canUseDebug) {
      toast.error('You do not have permission to use Debug Mode');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          monitoring_mode_preference: newMode
        } as any)
        .eq('id', user?.id);

      if (error) throw error;
      
      onModeChange(newMode);
      toast.success(`Switched to ${newMode === 'debug' ? 'Debug' : 'Default'} Mode`);
    } catch (error) {
      console.error('Error updating mode:', error);
      toast.error('Failed to update monitoring mode');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={mode === 'default' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleModeChange('default')}
        className="gap-2"
      >
        <Eye className="w-4 h-4" />
        Default
      </Button>
      <Button
        variant={mode === 'debug' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleModeChange('debug')}
        disabled={!canUseDebug}
        className="gap-2"
      >
        <Bug className="w-4 h-4" />
        Debug
        {!canUseDebug && <Badge variant="destructive" className="ml-1">Locked</Badge>}
      </Button>
    </div>
  );
};
