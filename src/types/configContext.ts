
import { CategoryConfig, ChatSession, ChatMessage, WebhookConfig, FreshdeskConfig, GeneralSetting, FreshdeskTicket } from './config';
import { FreshdeskConversation, CreateNoteData } from '@/services/freshdeskConversationService';

export interface ConfigContextType {
  webhookConfigs: WebhookConfig[];
  freshdeskConfigs: FreshdeskConfig[];
  generalSettings: GeneralSetting[];
  categoryConfigs: CategoryConfig[];
  tickets: FreshdeskTicket[];
  activeWebhook: WebhookConfig | null;
  activeFreshdesk: FreshdeskConfig | null;
  loading: boolean;
  ticketsLoading: boolean;
  saveWebhookConfig: (config: Omit<WebhookConfig, 'id'>) => Promise<boolean>;
  updateWebhookConfig: (id: string, config: Partial<WebhookConfig>) => Promise<boolean>;
  deleteWebhookConfig: (id: string) => Promise<boolean>;
  saveFreshdeskConfig: (config: Omit<FreshdeskConfig, 'id'>) => Promise<boolean>;
  updateFreshdeskConfig: (id: string, config: Partial<FreshdeskConfig>) => Promise<boolean>;
  deleteFreshdeskConfig: (id: string) => Promise<boolean>;
  saveCategoryConfig: (config: Omit<CategoryConfig, 'id'>) => Promise<boolean>;
  updateCategoryConfig: (id: string, config: Partial<CategoryConfig>) => Promise<boolean>;
  deleteCategoryConfig: (id: string) => Promise<boolean>;
  testWebhookConnection: (url: string, method?: 'GET' | 'POST', customBody?: any) => Promise<any>;
  testFreshdeskConnection: (domain: string, apiKey: string) => Promise<boolean>;
  fetchFreshdeskTickets: () => Promise<void>;
  createFreshdeskTicket: (ticketData: any) => Promise<boolean>;
  updateFreshdeskTicket: (ticketId: number, ticketData: any) => Promise<boolean>;
  fetchTicketConversations: (ticketId: number) => Promise<FreshdeskConversation[]>;
  addNoteToTicket: (ticketId: number, noteData: CreateNoteData) => Promise<boolean>;
  refreshConfigs: () => Promise<void>;
  chatSessions: ChatSession[];
  currentChatSession: ChatSession | null;
  chatMessages: ChatMessage[];
  
  getCategoriesByParent: (parentId: string | null) => CategoryConfig[];
  getCategoryPath: (categoryId: string) => CategoryConfig[];
  
  createChatSession: (title?: string) => Promise<ChatSession | null>;
  loadChatSessions: () => Promise<void>;
  loadChatMessages: (sessionId: string) => Promise<void>;
  setCurrentChatSession: (session: ChatSession | null) => void;
  addChatMessage: (sessionId: string, message: string, sender: 'user' | 'bot') => Promise<void>;
  updateChatSessionTitle: (sessionId: string, title: string) => Promise<void>;
  createTicketFromChat: (sessionId: string, summary: string) => Promise<boolean>;
  deleteChatSession: (sessionId: string) => Promise<boolean>;
}
