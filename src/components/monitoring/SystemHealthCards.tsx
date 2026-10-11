import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, Activity, AlertTriangle, TrendingUp, LogIn, UserPlus, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MonitoringMetrics } from '@/types/monitoring';

export const SystemHealthCards = () => {
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [
        { count: totalUsers },
        { count: activeSessions },
        { count: totalChatSessions },
        { count: apiRequests },
        { count: failedRequests }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('chat_sessions').select('*', { count: 'exact', head: true }).gte('updated_at', last24Hours),
        supabase.from('chat_sessions').select('*', { count: 'exact', head: true }).gte('created_at', last7Days),
        supabase.from('request_logs').select('*', { count: 'exact', head: true }).gte('timestamp', last24Hours),
        supabase.from('response_logs').select('*', { count: 'exact', head: true }).gte('status_code', 400).gte('timestamp', last24Hours),
      ]);

      setMetrics({
        totalUsers: totalUsers || 0,
        activeSessions: activeSessions || 0,
        totalChatSessions: totalChatSessions || 0,
        apiRequests: apiRequests || 0,
        failedRequests: failedRequests || 0,
        avgResponseTime: 0,
        totalLogins: 0,
        failedLogins: 0,
        newSignups: 0,
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { title: 'Total Users', value: metrics.totalUsers, icon: Users, color: 'text-primary' },
    { title: 'Active Sessions (24h)', value: metrics.activeSessions, icon: Activity, color: 'text-accent' },
    { title: 'Chat Sessions (7d)', value: metrics.totalChatSessions, icon: MessageSquare, color: 'text-primary' },
    { title: 'API Requests (24h)', value: metrics.apiRequests, icon: TrendingUp, color: 'text-accent' },
    { title: 'Failed Requests (24h)', value: metrics.failedRequests, icon: AlertTriangle, color: 'text-destructive' },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`w-4 h-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
