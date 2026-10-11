
import { useCallback } from 'react';
import { SupabaseService } from '@/services/supabaseService';
import { ChatSession, ChatMessage } from '@/types/config';

interface CustomerInfo {
  customerName: string;
  customerEmail: string;
  customerNumber: string;
  deviceSerials: string[];
}

export const useChatSession = () => {
  const loadChatSessions = useCallback(async (): Promise<ChatSession[]> => {
    return await SupabaseService.loadChatSessions();
  }, []);

  const createChatSession = useCallback(
    async (
      title?: string, 
      chat_type: 'support' | 'general' = 'support', 
      webhook_id?: string | null,
      customerInfo?: CustomerInfo
    ): Promise<ChatSession | null> => {
      return await SupabaseService.createChatSession(
        title || 'New Chat', 
        chat_type, 
        webhook_id || null,
        customerInfo
      );
    },
    []
  );

  const updateChatSessionCustomerInfo = useCallback(
    async (sessionId: string, customerInfo: CustomerInfo): Promise<boolean> => {
      return await SupabaseService.updateChatSessionCustomerInfo(sessionId, customerInfo);
    },
    []
  );

  const updateChatSessionTicketId = useCallback(
    async (sessionId: string, ticketId: string): Promise<boolean> => {
      return await SupabaseService.updateChatSessionTicketId(sessionId, ticketId);
    },
    []
  );

  const loadChatMessages = useCallback(async (sessionId: string): Promise<ChatMessage[]> => {
    return await SupabaseService.loadChatMessages(sessionId);
  }, []);

  const addChatMessage = useCallback(
    async (sessionId: string, message: string, sender: 'user' | 'bot'): Promise<ChatMessage | null> => {
      return await SupabaseService.addChatMessage(sessionId, message, sender);
    },
    []
  );

  const updateChatSessionTitle = useCallback(async (sessionId: string, title: string): Promise<boolean> => {
    return await SupabaseService.updateChatSessionTitle(sessionId, title);
  }, []);

  const createTicketFromChat = useCallback(async (sessionId: string, summary: string, activeFreshdesk: any): Promise<boolean> => {
    console.log('Creating ticket from chat', sessionId, summary, activeFreshdesk);
    return new Promise((resolve) => resolve(true));
  }, []);

  const deleteChatSession = useCallback(async (sessionId: string): Promise<boolean> => {
    return await SupabaseService.deleteChatSession(sessionId);
  }, []);

  return {
    loadChatSessions,
    createChatSession,
    updateChatSessionCustomerInfo,
    updateChatSessionTicketId,
    loadChatMessages,
    addChatMessage,
    updateChatSessionTitle,
    createTicketFromChat,
    deleteChatSession,
  };
};
