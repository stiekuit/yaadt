import { useState, useEffect } from 'react';
import { MonitoringModeToggle } from './MonitoringModeToggle';
import { SystemHealthCards } from './SystemHealthCards';
import { AuthenticationMonitor } from './AuthenticationMonitor';
import { SecurityEventLog } from './SecurityEventLog';
import { ActivityCharts } from './ActivityCharts';
import { useAuth } from '@/hooks/useAuth';
import { MonitoringMode } from '@/types/monitoring';
import { Separator } from '@/components/ui/separator';

export const MonitoringDashboard = () => {
  const { profile } = useAuth();
  const [mode, setMode] = useState<MonitoringMode>('default');
  const [canUseDebug, setCanUseDebug] = useState(false);

  useEffect(() => {
    if (profile) {
      setMode((profile as any).monitoring_mode_preference || 'default');
      setCanUseDebug((profile as any).can_use_debug_mode || false);
    }
  }, [profile]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Platform Monitoring</h3>
          <p className="text-sm text-muted-foreground">
            {mode === 'debug' 
              ? 'Debug mode: Comprehensive logs and real-time monitoring'
              : 'Default mode: Production-ready metrics and critical events'}
          </p>
        </div>
        <MonitoringModeToggle 
          mode={mode} 
          onModeChange={setMode}
          canUseDebug={canUseDebug}
        />
      </div>

      <Separator />

      <SystemHealthCards />

      <div className="grid grid-cols-1 gap-6">
        <AuthenticationMonitor />
        
        {mode === 'debug' && (
          <>
            <ActivityCharts />
            <SecurityEventLog />
          </>
        )}
      </div>
    </div>
  );
};
