import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Maximize2, Minimize2, Activity, Users, AlertTriangle, LogIn } from 'lucide-react';
import { useMobileMode } from '@/hooks/useMobileMode';
import { MonitoringMetrics } from '@/types/monitoring';
import { supabase } from '@/integrations/supabase/client';

export const MobileMonitoringView = () => {
  const isMobile = useMobileMode();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [metrics, setMetrics] = useState<MonitoringMetrics>({
    totalUsers: 0,
    activeSessions: 0,
    totalChatSessions: 0,
    apiRequests: 0,
    failedRequests: 0,
    avgResponseTime: 0,
    totalLogins: 0,
    failedLogins: 0,
    newSignups: 0,
  });

  useEffect(() => {
    if (isMobile) {
      loadMobileMetrics();
      const interval = setInterval(loadMobileMetrics, 30000);
      return () => clearInterval(interval);
    }
  }, [isMobile]);

  const loadMobileMetrics = async () => {
    try {
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const [
        { count: totalUsers },
        { count: activeSessions },
        { count: failedRequests }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('chat_sessions').select('*', { count: 'exact', head: true }).gte('updated_at', last24Hours),
        supabase.from('response_logs').select('*', { count: 'exact', head: true }).gte('status_code', 400).gte('timestamp', last24Hours),
      ]);

      setMetrics(prev => ({
        ...prev,
        totalUsers: totalUsers || 0,
        activeSessions: activeSessions || 0,
        failedRequests: failedRequests || 0,
      }));
    } catch (error) {
      console.error('Error loading mobile metrics:', error);
    }
  };

  const toggleFullScreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  if (!isMobile) return null;

  const cards = [
    { title: 'Users', value: metrics.totalUsers, icon: Users, color: 'bg-primary' },
    { title: 'Active', value: metrics.activeSessions, icon: Activity, color: 'bg-accent' },
    { title: 'Errors', value: metrics.failedRequests, icon: AlertTriangle, color: 'bg-destructive' },
  ];

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Monitoring</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFullScreen}
          className="gap-2"
        >
          {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          {isFullScreen ? 'Exit' : 'Full Screen'}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <Card key={card.title} className="touch-manipulation">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className={`p-2 rounded-full ${card.color}`}>
                  <card.icon className="w-4 h-4 text-white" />
                </div>
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
