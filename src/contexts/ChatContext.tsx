
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useChatSession } from '@/hooks/useChatSession';
import { ChatSession, ChatMessage } from '@/types/config';
import { useAuth } from '@/hooks/useAuth';

interface CustomerInfo {
  customerName: string;
  customerEmail: string;
  customerNumber: string;
  deviceSerials: string[];
}

interface ChatContextType {
  chatSessions: ChatSession[];
  currentChatSession: ChatSession | null;
  chatMessages: ChatMessage[];
  currentChatType: 'support' | 'general';
  customerInfo: CustomerInfo;
  setCurrentChatType: (type: 'support' | 'general') => void;
  setCustomerInfo: (info: CustomerInfo) => void;
  saveCustomerInfo: () => Promise<void>;
  createChatSession: (title?: string, type?: 'support' | 'general') => Promise<ChatSession | null>;
  loadChatSessions: () => Promise<void>;
  loadChatMessages: (sessionId: string) => Promise<void>;
  setCurrentChatSession: (session: ChatSession | null) => void;
  addChatMessage: (sessionId: string, message: string, sender: 'user' | 'bot') => Promise<void>;
  updateChatSessionTitle: (sessionId: string, title: string) => Promise<void>;
  updateChatSessionTicketId: (sessionId: string, ticketId: string) => Promise<void>;
  createTicketFromChat: (sessionId: string, summary: string) => Promise<boolean>;
  deleteChatSession: (sessionId: string) => Promise<boolean>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
  activeFreshdesk: any;
}

export const ChatProvider = ({ children, activeFreshdesk }: ChatProviderProps) => {
  const { user } = useAuth();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentChatSession, setCurrentChatSession] = useState<ChatSession | null>(null);
  const [currentChatType, setCurrentChatType] = useState<'support' | 'general'>('support');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    customerName: '',
    customerEmail: '',
    customerNumber: '',
    deviceSerials: []
  });

  const chatHook = useChatSession();

  useEffect(() => {
    loadChatSessionsData();
  }, [currentChatType]);

  // Clear current session when switching chat types if it doesn't match
  useEffect(() => {
    if (currentChatSession && currentChatSession.chat_type !== currentChatType) {
      console.log(`🔄 Clearing current session because it's ${currentChatSession.chat_type} but we're now in ${currentChatType} mode`);
      setCurrentChatSession(null);
      setChatMessages([]);
      // Reset customer info when switching away from support chat
      if (currentChatType !== 'support') {
        setCustomerInfo({
          customerName: '',
          customerEmail: '',
          customerNumber: '',
          deviceSerials: []
        });
      }
    }
  }, [currentChatType, currentChatSession]);

  // Load customer info when setting a current chat session
  useEffect(() => {
    if (currentChatSession && currentChatType === 'support') {
      setCustomerInfo({
        customerName: currentChatSession.customer_name || '',
        customerEmail: currentChatSession.customer_email || '',
        customerNumber: currentChatSession.customer_number || '',
        deviceSerials: currentChatSession.device_serials || []
      });
    }
  }, [currentChatSession, currentChatType]);

  const loadChatSessionsData = async () => {
    console.log(`📋 Loading chat sessions for type: ${currentChatType}`);
    const sessions = await chatHook.loadChatSessions();
    // Filter by chat type - RLS policies now handle user ownership automatically
    const filteredSessions = sessions.filter(s => s.chat_type === currentChatType);
    console.log(`📋 Found ${sessions.length} total sessions, ${filteredSessions.length} for ${currentChatType} type`);
    setChatSessions(filteredSessions);
  };

  const loadChatMessagesData = async (sessionId: string) => {
    const messages = await chatHook.loadChatMessages(sessionId);
    setChatMessages(messages);
  };

  const saveCustomerInfo = async (): Promise<void> => {
    // Guest users cannot save customer info
    if (!user) {
      console.log('Guest users cannot save customer info');
      return;
    }

    if (!currentChatSession || currentChatType !== 'support') {
      return;
    }

    try {
      const success = await chatHook.updateChatSessionCustomerInfo(currentChatSession.id, customerInfo);
      if (success) {
        // Update the current session with new customer info
        setCurrentChatSession({
          ...currentChatSession,
          customer_name: customerInfo.customerName,
          customer_email: customerInfo.customerEmail,
          customer_number: customerInfo.customerNumber,
          device_serials: customerInfo.deviceSerials
        });
        
        // Update sessions list
        setChatSessions(prev => 
          prev.map(session => 
            session.id === currentChatSession.id 
              ? {
                  ...session,
                  customer_name: customerInfo.customerName,
                  customer_email: customerInfo.customerEmail,
                  customer_number: customerInfo.customerNumber,
                  device_serials: customerInfo.deviceSerials
                }
              : session
          )
        );
      }
    } catch (error) {
      console.error('Error saving customer info:', error);
    }
  };

  const updateChatSessionTicketIdData = async (sessionId: string, ticketId: string) => {
    try {
      const success = await chatHook.updateChatSessionTicketId(sessionId, ticketId);
      if (success) {
        // Update the current session with the ticket ID
        if (currentChatSession?.id === sessionId) {
          setCurrentChatSession({
            ...currentChatSession,
            ticket_id: ticketId
          });
        }
        
        // Update sessions list
        setChatSessions(prev => 
          prev.map(session => 
            session.id === sessionId 
              ? { ...session, ticket_id: ticketId }
              : session
          )
        );
      }
    } catch (error) {
      console.error('Error updating chat session ticket ID:', error);
    }
  };

  const createChatSessionData = async (title?: string, type?: 'support' | 'general') => {
    // Guest users cannot create chat sessions
    if (!user) {
      console.log('Guest users cannot create chat sessions');
      return null;
    }

    const chatType = type || currentChatType;
    
    // Get the appropriate webhook for the chat type
    let webhookId = null;
    try {
      const { data: webhooks } = await supabase
        .from('webhook_config')
        .select('id')
        .eq('chat_type', chatType)
        .eq('is_active', true)
        .limit(1);
      
      if (webhooks && webhooks.length > 0) {
        webhookId = webhooks[0].id;
        console.log(`🔗 Assigning webhook ${webhookId} to new ${chatType} chat session`);
      }
    } catch (error) {
      console.error('Error fetching webhook for chat session:', error);
    }

    // Pass customer info only for support chats
    const customerInfoToPass = chatType === 'support' ? customerInfo : undefined;
    
    const session = await chatHook.createChatSession(title, chatType, webhookId, customerInfoToPass);
    if (session) {
      setCurrentChatSession(session);
      setChatSessions(prev => [session, ...prev]);
    }
    return session;
  };

  const setCurrentChatTypeHandler = (type: 'support' | 'general') => {
    console.log(`🔄 Switching chat type from ${currentChatType} to ${type}`);
    setCurrentChatType(type);
  };

  const setCurrentChatSessionHandler = (session: ChatSession | null) => {
    if (session && session.chat_type !== currentChatType) {
      console.warn(`⚠️ Attempted to set session with type ${session.chat_type} while in ${currentChatType} mode`);
      return;
    }
    setCurrentChatSession(session);
  };

  const addChatMessageData = async (sessionId: string, message: string, sender: 'user' | 'bot') => {
    // Guest users cannot save messages
    if (!user) {
      console.log('Guest users cannot save messages');
      return;
    }

    const newMessage = await chatHook.addChatMessage(sessionId, message, sender);
    if (newMessage) {
      setChatMessages(prev => [...prev, newMessage]);
    }
  };

  const updateChatSessionTitleData = async (sessionId: string, title: string) => {
    const success = await chatHook.updateChatSessionTitle(sessionId, title);
    if (success) {
      setChatSessions(prev => 
        prev.map(session => 
          session.id === sessionId ? { ...session, title } : session
        )
      );
    }
  };

  const deleteChatSessionData = async (sessionId: string): Promise<boolean> => {
    const success = await chatHook.deleteChatSession(sessionId);
    if (success) {
      setChatSessions(prev => prev.filter(session => session.id !== sessionId));
      
      if (currentChatSession?.id === sessionId) {
        setCurrentChatSession(null);
        setChatMessages([]);
      }
    }
    return success;
  };

  const createTicketFromChatData = async (sessionId: string, summary: string) => {
    return await chatHook.createTicketFromChat(sessionId, summary, activeFreshdesk);
  };

  const value: ChatContextType = {
    chatSessions,
    currentChatSession,
    chatMessages,
    currentChatType,
    customerInfo,
    setCurrentChatType: setCurrentChatTypeHandler,
    setCustomerInfo,
    saveCustomerInfo,
    createChatSession: createChatSessionData,
    loadChatSessions: loadChatSessionsData,
    loadChatMessages: loadChatMessagesData,
    setCurrentChatSession: setCurrentChatSessionHandler,
    addChatMessage: addChatMessageData,
    updateChatSessionTitle: updateChatSessionTitleData,
    updateChatSessionTicketId: updateChatSessionTicketIdData,
    createTicketFromChat: createTicketFromChatData,
    deleteChatSession: deleteChatSessionData,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
