// Monitoring types for the dashboard

export interface AuthAuditLog {
  id: string;
  user_id: string | null;
  event_type: 'login' | 'logout' | 'signup' | 'failed_login' | 'password_reset' | 'email_change';
  email: string;
  ip_address: string | null;
  user_agent: string | null;
  location: any | null;
  success: boolean;
  failure_reason: string | null;
  session_id: string | null;
  created_at: string;
}

export interface AdminQuery {
  id: string;
  user_id: string;
  query_name: string;
  query_sql: string;
  is_template: boolean;
  execution_count: number;
  last_executed_at: string | null;
  created_at: string;
}

export interface MonitoringMetrics {
  totalUsers: number;
  activeSessions: number;
  totalChatSessions: number;
  apiRequests: number;
  failedRequests: number;
  avgResponseTime: number;
  totalLogins: number;
  failedLogins: number;
  newSignups: number;
}

export type MonitoringMode = 'default' | 'debug';
