import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { AuthAuditLog } from '@/types/monitoring';
import { format } from 'date-fns';
import { CheckCircle2, XCircle, LogIn, LogOut, UserPlus, KeyRound } from 'lucide-react';

export const AuthenticationMonitor = () => {
  const [logs, setLogs] = useState<AuthAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuthLogs();
    const interval = setInterval(loadAuthLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadAuthLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('auth_audit_logs' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs((data || []) as unknown as AuthAuditLog[]);
    } catch (error) {
      console.error('Error loading auth logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'login': return <LogIn className="w-4 h-4" />;
      case 'logout': return <LogOut className="w-4 h-4" />;
      case 'signup': return <UserPlus className="w-4 h-4" />;
      case 'failed_login': return <XCircle className="w-4 h-4" />;
      case 'password_reset': return <KeyRound className="w-4 h-4" />;
      default: return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const getEventColor = (eventType: string, success: boolean) => {
    if (!success || eventType === 'failed_login') return 'destructive';
    if (eventType === 'signup') return 'default';
    return 'secondary';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No authentication events yet
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getEventIcon(log.event_type)}
                          <span className="capitalize">{log.event_type.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{log.email}</TableCell>
                      <TableCell className="text-sm">{log.ip_address || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={getEventColor(log.event_type, log.success)}>
                          {log.success ? 'Success' : 'Failed'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
