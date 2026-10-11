import React, { createContext, useContext, ReactNode } from 'react';
import { ChatProvider, useChat } from './ChatContext';
import { FreshdeskProvider, useFreshdesk } from './FreshdeskContext';
import { WebhookProvider, useWebhook } from './WebhookContext';
import { CategoryProvider, useCategory } from './CategoryContext';
import { SettingsProvider } from './SettingsContext';
import { BrandingProvider } from './BrandingContext';

// Customer info interface
interface CustomerInfo {
  customerName: string;
  customerEmail: string;
  customerNumber: string;
  deviceSerials: string[];
}

// Define the combined context type
interface ConfigContextType {
  // Webhook context
  webhookConfigs: any[];
  activeWebhook: any;
  activeSupportWebhook: any;      // NEW
  activeGeneralWebhook: any;      // NEW
  saveWebhookConfig: (config: any) => Promise<boolean>;
  updateWebhookConfig: (id: string, config: any) => Promise<boolean>;
  deleteWebhookConfig: (id: string) => Promise<boolean>;
  testWebhookConnection: (url: string, method?: string, customBody?: any) => Promise<any>;
  
  // Freshdesk context
  freshdeskConfigs: any[];
  activeFreshdesk: any;
  tickets: any[];
  ticketsLoading: boolean;
  saveFreshdeskConfig: (config: any) => Promise<boolean>;
  updateFreshdeskConfig: (id: string, config: any) => Promise<boolean>;
  deleteFreshdeskConfig: (id: string) => Promise<boolean>;
  testFreshdeskConnection: (domain: string, apiKey: string) => Promise<boolean>;
  fetchFreshdeskTickets: () => Promise<void>;
  createFreshdeskTicket: (ticketData: any) => Promise<any>;
  updateFreshdeskTicket: (ticketId: number, ticketData: any) => Promise<boolean>;
  fetchTicketConversations: (ticketId: number) => Promise<any[]>;
  addNoteToTicket: (ticketId: number, noteData: any) => Promise<boolean>;
  
  // Category context
  categoryConfigs: any[];
  saveCategoryConfig: (config: any) => Promise<boolean>;
  updateCategoryConfig: (id: string, config: any) => Promise<boolean>;
  deleteCategoryConfig: (id: string) => Promise<boolean>;
  getCategoriesByParent: (parentId: string | null) => any[];
  getCategoryPath: (categoryId: string) => any[];
  
  // Chat context
  chatSessions: any[];
  currentChatSession: any;
  chatMessages: any[];
  currentChatType: any;
  setCurrentChatType: (type: any) => void;
  customerInfo: CustomerInfo;
  setCustomerInfo: (info: CustomerInfo) => void;
  saveCustomerInfo: () => Promise<void>;
  createChatSession: (title?: string) => Promise<any>;
  loadChatSessions: () => Promise<void>;
  loadChatMessages: (sessionId: string) => Promise<void>;
  setCurrentChatSession: (session: any) => void;
  addChatMessage: (sessionId: string, message: string, sender: 'user' | 'bot') => Promise<void>;
  updateChatSessionTitle: (sessionId: string, title: string) => Promise<void>;
  createTicketFromChat: (sessionId: string, summary: string) => Promise<boolean>;
  deleteChatSession: (sessionId: string) => Promise<boolean>;
  
  // Legacy compatibility
  generalSettings: any[];
  loading: boolean;
  refreshConfigs: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

interface ConfigProviderProps {
  children: ReactNode;
}

// Inner component that has access to all contexts
const ConfigProviderInner = ({ children }: ConfigProviderProps) => {
  const webhookContext = useWebhook();
  const freshdeskContext = useFreshdesk();
  const categoryContext = useCategory();
  const chatContext = useChat();

  const configValue: ConfigContextType = {
    // Webhook context values
    webhookConfigs: webhookContext.webhookConfigs,
    activeWebhook: webhookContext.activeWebhook,
    activeSupportWebhook: webhookContext.activeSupportWebhook,     // NEW
    activeGeneralWebhook: webhookContext.activeGeneralWebhook,     // NEW
    saveWebhookConfig: webhookContext.saveWebhookConfig,
    updateWebhookConfig: webhookContext.updateWebhookConfig,
    deleteWebhookConfig: webhookContext.deleteWebhookConfig,
    testWebhookConnection: webhookContext.testWebhookConnection,
    
    // Freshdesk context values
    freshdeskConfigs: freshdeskContext.freshdeskConfigs,
    activeFreshdesk: freshdeskContext.activeFreshdesk,
    tickets: freshdeskContext.tickets,
    ticketsLoading: freshdeskContext.ticketsLoading,
    saveFreshdeskConfig: freshdeskContext.saveFreshdeskConfig,
    updateFreshdeskConfig: freshdeskContext.updateFreshdeskConfig,
    deleteFreshdeskConfig: freshdeskContext.deleteFreshdeskConfig,
    testFreshdeskConnection: freshdeskContext.testFreshdeskConnection,
    fetchFreshdeskTickets: freshdeskContext.fetchFreshdeskTickets,
    createFreshdeskTicket: freshdeskContext.createFreshdeskTicket,
    updateFreshdeskTicket: freshdeskContext.updateFreshdeskTicket,
    fetchTicketConversations: freshdeskContext.fetchTicketConversations,
    addNoteToTicket: freshdeskContext.addNoteToTicket,
    
    // Category context values
    categoryConfigs: categoryContext.categoryConfigs,
    saveCategoryConfig: categoryContext.saveCategoryConfig,
    updateCategoryConfig: categoryContext.updateCategoryConfig,
    deleteCategoryConfig: categoryContext.deleteCategoryConfig,
    getCategoriesByParent: categoryContext.getCategoriesByParent,
    getCategoryPath: categoryContext.getCategoryPath,
    
    // Chat context values
    chatSessions: chatContext.chatSessions,
    currentChatSession: chatContext.currentChatSession,
    chatMessages: chatContext.chatMessages,
    currentChatType: chatContext.currentChatType,
    setCurrentChatType: chatContext.setCurrentChatType,
    customerInfo: chatContext.customerInfo,
    setCustomerInfo: chatContext.setCustomerInfo,
    saveCustomerInfo: chatContext.saveCustomerInfo,
    createChatSession: chatContext.createChatSession,
    loadChatSessions: chatContext.loadChatSessions,
    loadChatMessages: chatContext.loadChatMessages,
    setCurrentChatSession: chatContext.setCurrentChatSession,
    addChatMessage: chatContext.addChatMessage,
    updateChatSessionTitle: chatContext.updateChatSessionTitle,
    createTicketFromChat: chatContext.createTicketFromChat,
    deleteChatSession: chatContext.deleteChatSession,
    
    // Legacy compatibility
    generalSettings: [],
    loading: false,
    refreshConfigs: async () => {},
  };

  return (
    <ConfigContext.Provider value={configValue}>
      {children}
    </ConfigContext.Provider>
  );
};

// Wrapper to provide activeFreshdesk to ChatProvider
const ChatProviderWithFreshdesk = ({ children }: { children: ReactNode }) => {
  const freshdeskContext = useFreshdesk();
  return (
    <ChatProvider activeFreshdesk={freshdeskContext?.activeFreshdesk || null}>
      {children}
    </ChatProvider>
  );
};

export const ConfigProvider = ({ children }: ConfigProviderProps) => {
  return (
    <WebhookProvider>
      <FreshdeskProvider>
        <CategoryProvider>
          <ChatProviderWithFreshdesk>
            <ConfigProviderInner>
              {children}
            </ConfigProviderInner>
          </ChatProviderWithFreshdesk>
        </CategoryProvider>
      </FreshdeskProvider>
    </WebhookProvider>
  );
};

export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
