import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

export const ActivityCharts = () => {
  const [userActivityData, setUserActivityData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    try {
      // Load chat sessions per day for last 7 days
      const { data: sessions } = await supabase
        .from('chat_sessions')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Group by day
      const grouped = (sessions || []).reduce((acc: any, session: any) => {
        const day = new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {});

      const activityData = Object.entries(grouped).map(([day, count]) => ({
        day,
        sessions: count
      }));

      setUserActivityData(activityData);

      // Load response status distribution
      const { data: responses } = await supabase
        .from('response_logs')
        .select('status_code')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const statusGroups = (responses || []).reduce((acc: any, res: any) => {
        const category = res.status_code < 300 ? 'Success' : res.status_code < 400 ? 'Redirect' : res.status_code < 500 ? 'Client Error' : 'Server Error';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      const statusChartData = Object.entries(statusGroups).map(([name, value]) => ({
        name,
        value
      }));

      setStatusData(statusChartData);
    } catch (error) {
      console.error('Error loading chart data:', error);
    }
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--destructive))', 'hsl(var(--muted))'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>User Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem'
                }} 
              />
              <Legend />
              <Line type="monotone" dataKey="sessions" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Response Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="hsl(var(--primary))"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
