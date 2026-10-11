
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFreshdeskConfig } from '@/hooks/useFreshdeskConfig';
import { FreshdeskConfig, FreshdeskTicket } from '@/types/config';
import { CreateNoteData } from '@/services/freshdeskConversationService';

interface FreshdeskContextType {
  freshdeskConfigs: FreshdeskConfig[];
  tickets: FreshdeskTicket[];
  activeFreshdesk: FreshdeskConfig | null;
  ticketsLoading: boolean;
  saveFreshdeskConfig: (config: Omit<FreshdeskConfig, 'id'>) => Promise<boolean>;
  updateFreshdeskConfig: (id: string, config: Partial<FreshdeskConfig>) => Promise<boolean>;
  deleteFreshdeskConfig: (id: string) => Promise<boolean>;
  testFreshdeskConnection: (domain: string, apiKey: string) => Promise<boolean>;
  fetchFreshdeskTickets: () => Promise<void>;
  createFreshdeskTicket: (ticketData: any) => Promise<FreshdeskTicket | null>;
  updateFreshdeskTicket: (ticketId: number, ticketData: any) => Promise<boolean>;
  fetchTicketConversations: (ticketId: number) => Promise<any[]>;
  addNoteToTicket: (ticketId: number, noteData: CreateNoteData) => Promise<boolean>;
}

const FreshdeskContext = createContext<FreshdeskContextType | undefined>(undefined);

export const useFreshdesk = (): FreshdeskContextType => {
  const context = useContext(FreshdeskContext);
  if (!context) {
    throw new Error('useFreshdesk must be used within a FreshdeskProvider');
  }
  return context;
};

interface FreshdeskProviderProps {
  children: ReactNode;
}

export const FreshdeskProvider = ({ children }: FreshdeskProviderProps) => {
  const [freshdeskConfigs, setFreshdeskConfigs] = useState<FreshdeskConfig[]>([]);
  const [tickets, setTickets] = useState<FreshdeskTicket[]>([]);
  const [activeFreshdesk, setActiveFreshdesk] = useState<FreshdeskConfig | null>(null);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  const freshdeskHook = useFreshdeskConfig();

  useEffect(() => {
    loadFreshdeskConfigs();
  }, []);

  const loadFreshdeskConfigs = async () => {
    try {
      const { data: freshdesks, error } = await supabase
        .from('freshdesk_config')
        .select('*');
      
      if (error) {
        console.error('Error fetching Freshdesk configs:', error);
        return;
      }

      setFreshdeskConfigs(freshdesks || []);
      const activeConfig = freshdesks?.find((config: FreshdeskConfig) => config.is_active) || null;
      setActiveFreshdesk(activeConfig);

      if (activeConfig) {
        await fetchFreshdeskTicketsData();
      }
    } catch (error) {
      console.error('Error in loadFreshdeskConfigs:', error);
    }
  };

  const fetchFreshdeskTicketsData = async () => {
    setTicketsLoading(true);
    try {
      if (activeFreshdesk) {
        const fetchedTickets = await freshdeskHook.fetchFreshdeskTickets(activeFreshdesk);
        setTickets(fetchedTickets);
      }
    } catch (error) {
      console.error('Error fetching Freshdesk tickets:', error);
    } finally {
      setTicketsLoading(false);
    }
  };

  const createFreshdeskTicketData = async (ticketData: any): Promise<FreshdeskTicket | null> => {
    return await freshdeskHook.createFreshdeskTicket(ticketData);
  };

  const updateFreshdeskTicketData = async (ticketId: number, ticketData: any): Promise<boolean> => {
    return await freshdeskHook.updateFreshdeskTicket(ticketId, ticketData);
  };

  const fetchTicketConversationsData = async (ticketId: number) => {
    if (!activeFreshdesk) {
      throw new Error('No active Freshdesk configuration found');
    }
    return await freshdeskHook.fetchTicketConversations(activeFreshdesk, ticketId);
  };

  const addNoteToTicketData = async (ticketId: number, noteData: CreateNoteData) => {
    if (!activeFreshdesk) {
      return false;
    }
    return await freshdeskHook.addNoteToTicket(activeFreshdesk, ticketId, noteData);
  };

  const value: FreshdeskContextType = {
    freshdeskConfigs,
    tickets,
    activeFreshdesk,
    ticketsLoading,
    saveFreshdeskConfig: freshdeskHook.saveFreshdeskConfig,
    updateFreshdeskConfig: freshdeskHook.updateFreshdeskConfig,
    deleteFreshdeskConfig: freshdeskHook.deleteFreshdeskConfig,
    testFreshdeskConnection: freshdeskHook.testFreshdeskConnection,
    fetchFreshdeskTickets: fetchFreshdeskTicketsData,
    createFreshdeskTicket: createFreshdeskTicketData,
    updateFreshdeskTicket: updateFreshdeskTicketData,
    fetchTicketConversations: fetchTicketConversationsData,
    addNoteToTicket: addNoteToTicketData,
  };

  return (
    <FreshdeskContext.Provider value={value}>
      {children}
    </FreshdeskContext.Provider>
  );
};
