
export interface CategoryConfig {
  id: string;
  name: string;
  parent_id: string | null;
  level: number;
  display_order: number;
  freshdesk_config_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  chat_type: 'support' | 'general';
  webhook_id?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_number?: string | null;
  device_serials?: string[] | null;
  ticket_id?: string | null;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  message: string;
  sender: 'user' | 'bot';
  created_at: string;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  is_active: boolean;
  chat_type?: 'support' | 'general';
  allow_guest_access?: boolean;
}

export interface FreshdeskConfig {
  id: string;
  name: string;
  domain: string;
  api_key: string;
  is_active: boolean;
}

export interface GeneralSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  description?: string;
}

export interface FreshdeskTicket {
  id: number;
  subject: string;
  description_text: string;
  status: number;
  priority: number;
  requester_id: number;
  responder_id?: number;
  group_id?: number;
  created_at: string;
  updated_at: string;
  custom_fields?: any;
}
