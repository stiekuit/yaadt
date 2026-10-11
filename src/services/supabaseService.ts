import { supabase } from '@/integrations/supabase/client';
import { ChatSession, ChatMessage } from '@/types/config';

interface CustomerInfo {
  customerName?: string;
  customerEmail?: string;
  customerNumber?: string;
  deviceSerials?: string[];
}

export class SupabaseService {
  // Chat Sessions
  static async createChatSession(
    title: string = 'New Chat',
    chat_type: 'support' | 'general' = 'support',
    webhook_id: string | null = null,
    customerInfo?: CustomerInfo
  ): Promise<ChatSession | null> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        return null;
      }

      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([{ 
          title, 
          chat_type, 
          webhook_id,
          user_id: user.id, // Add user ownership
          customer_name: customerInfo?.customerName || null,
          customer_email: customerInfo?.customerEmail || null,
          customer_number: customerInfo?.customerNumber || null,
          device_serials: customerInfo?.deviceSerials || []
        }])
        .select('id, title, created_at, updated_at, chat_type, webhook_id, customer_name, customer_email, customer_number, device_serials, ticket_id')
        .single();

      if (error) {
        console.error('Error creating chat session:', error);
        return null;
      }

      return {
        id: data.id,
        title: data.title,
        created_at: data.created_at,
        updated_at: data.updated_at,
        chat_type: data.chat_type as 'support' | 'general',
        webhook_id: data.webhook_id || null,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_number: data.customer_number,
        device_serials: data.device_serials || [],
        ticket_id: data.ticket_id,
      };
    } catch (error) {
      console.error('Error in createChatSession:', error);
      return null;
    }
  }

  static async loadChatSessions(): Promise<ChatSession[]> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('id, title, created_at, updated_at, chat_type, webhook_id, customer_name, customer_email, customer_number, device_serials, ticket_id')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading chat sessions:', error);
        return [];
      }

      return (data || []).map(s => ({
        id: s.id,
        title: s.title,
        created_at: s.created_at,
        updated_at: s.updated_at,
        chat_type: (s.chat_type as 'support' | 'general') || 'support',
        webhook_id: s.webhook_id || null,
        customer_name: s.customer_name,
        customer_email: s.customer_email,
        customer_number: s.customer_number,
        device_serials: s.device_serials || [],
        ticket_id: s.ticket_id,
      }));
    } catch (error) {
      console.error('Error in loadChatSessions:', error);
      return [];
    }
  }

  static async updateChatSessionCustomerInfo(
    sessionId: string, 
    customerInfo: CustomerInfo
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({
          customer_name: customerInfo.customerName || null,
          customer_email: customerInfo.customerEmail || null,
          customer_number: customerInfo.customerNumber || null,
          device_serials: customerInfo.deviceSerials || []
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error updating customer info:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateChatSessionCustomerInfo:', error);
      return false;
    }
  }

  static async updateChatSessionTicketId(
    sessionId: string, 
    ticketId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({
          ticket_id: ticketId
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error updating chat session ticket ID:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateChatSessionTicketId:', error);
      return false;
    }
  }

  static async loadChatMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading chat messages:', error);
        return [];
      }

      return (data || []).map(message => ({
        ...message,
        sender: message.sender as 'user' | 'bot'
      }));
    } catch (error) {
      console.error('Error in loadChatMessages:', error);
      return [];
    }
  }

  static async addChatMessage(
    sessionId: string, 
    message: string, 
    sender: 'user' | 'bot'
  ): Promise<ChatMessage | null> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        return null;
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionId,
          message,
          sender,
          created_by: user.id, // Add user ownership
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding chat message:', error);
        return null;
      }

      return {
        ...data,
        sender: data.sender as 'user' | 'bot'
      };
    } catch (error) {
      console.error('Error in addChatMessage:', error);
      return null;
    }
  }

  static async updateChatSessionTitle(sessionId: string, title: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title })
        .eq('id', sessionId);

      if (error) {
        console.error('Error updating chat session title:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateChatSessionTitle:', error);
      return false;
    }
  }

  static async deleteChatSession(sessionId: string): Promise<boolean> {
    try {
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('session_id', sessionId);

      if (messagesError) {
        console.error('Error deleting chat messages:', messagesError);
        return false;
      }

      const { error: sessionError } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (sessionError) {
        console.error('Error deleting chat session:', sessionError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteChatSession:', error);
      return false;
    }
  }

  // Webhook configurations
  static async loadWebhookConfigs() {
    try {
      const { data, error } = await supabase
        .from('webhook_config')
        .select('*');
      
      if (error) {
        console.error('Error fetching webhooks:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in loadWebhookConfigs:', error);
      return [];
    }
  }

  // Freshdesk configurations
  static async loadFreshdeskConfigs() {
    try {
      const { data, error } = await supabase
        .from('freshdesk_config')
        .select('*');
      
      if (error) {
        console.error('Error fetching Freshdesk configs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in loadFreshdeskConfigs:', error);
      return [];
    }
  }

  // Category configurations
  static async loadCategoryConfigs() {
    try {
      const { data, error } = await supabase
        .from('freshdesk_category_config')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching category configs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in loadCategoryConfigs:', error);
      return [];
    }
  }

  // Permissions
  static async loadUserPermissions(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select(`
          *,
          permissions (
            name,
            description,
            category
          )
        `)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching user permissions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in loadUserPermissions:', error);
      return [];
    }
  }

  static async updateUserPermission(userId: string, permissionName: string, granted: boolean, grantedBy?: string) {
    try {
      // Get current user if grantedBy not provided
      if (!grantedBy) {
        const { data: { user } } = await supabase.auth.getUser();
        grantedBy = user?.id;
      }

      // First validate that the permission exists
      const { data: permissionExists, error: permError } = await supabase
        .from('permissions')
        .select('name')
        .eq('name', permissionName)
        .single();

      if (permError || !permissionExists) {
        console.error('Permission does not exist:', permissionName);
        return false;
      }

      // Use upsert with proper conflict resolution
      const { error } = await supabase
        .from('user_permissions')
        .upsert({
          user_id: userId,
          permission_name: permissionName,
          granted,
          granted_by: grantedBy,
          granted_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,permission_name',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Error updating user permission:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateUserPermission:', error);
      return false;
    }
  }

  static async loadAllPermissions() {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('category, name');
      
      if (error) {
        console.error('Error fetching permissions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in loadAllPermissions:', error);
      return [];
    }
  }
}
