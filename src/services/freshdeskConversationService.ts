
import { supabase } from '@/integrations/supabase/client';

export interface FreshdeskConversation {
  id: number;
  body: string;
  body_text: string;
  incoming: boolean;
  private: boolean;
  user_id: number;
  support_email: string;
  source: number;
  category: number;
  to_emails: string[];
  from_email: string;
  cc_emails: string[];
  bcc_emails: string[];
  created_at: string;
  updated_at: string;
  attachments: any[];
}

export interface FreshdeskActivity {
  id: number;
  actor_id: number;
  actor_type: string;
  performed_by: {
    id: number;
    name: string;
    email: string;
  };
  activity_type: string;
  field_name?: string;
  previous_value?: any;
  current_value?: any;
  created_at: string;
}

export interface CreateNoteData {
  body: string;
  private?: boolean;
  incoming?: boolean;
  notify_emails?: string[];
}

export class FreshdeskConversationService {
  private domain: string;
  private apiKey: string;

  constructor(domain: string, apiKey: string) {
    this.domain = domain;
    this.apiKey = apiKey;
  }

  private async callFreshdeskProxy(endpoint: string, method = 'GET', body?: any): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('freshdesk-proxy', {
        body: {
          domain: this.domain,
          apiKey: this.apiKey,
          endpoint,
          method,
          body
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      console.error('Error calling freshdesk-proxy:', error);
      throw error;
    }
  }

  async getTicketConversations(ticketId: number): Promise<FreshdeskConversation[]> {
    try {
      return await this.callFreshdeskProxy(`/tickets/${ticketId}/conversations`);
    } catch (error) {
      console.error('Error fetching ticket conversations:', error);
      throw error;
    }
  }

  async getTicketActivities(ticketId: number): Promise<FreshdeskActivity[]> {
    try {
      return await this.callFreshdeskProxy(`/tickets/${ticketId}/activities`);
    } catch (error) {
      console.error('Error fetching ticket activities:', error);
      throw error;
    }
  }

  async addNoteToTicket(ticketId: number, noteData: CreateNoteData): Promise<any> {
    try {
      return await this.callFreshdeskProxy(`/tickets/${ticketId}/notes`, 'POST', noteData);
    } catch (error) {
      console.error('Error adding note to ticket:', error);
      throw error;
    }
  }
}
