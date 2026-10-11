
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FreshdeskConfig, FreshdeskTicket } from '@/types/config';
import { FreshdeskConversation, CreateNoteData } from '@/services/freshdeskConversationService';

export const useFreshdeskConfig = () => {
  const { toast } = useToast();

  const saveFreshdeskConfig = async (config: Omit<FreshdeskConfig, 'id'>): Promise<boolean> => {
    try {
      if (config.is_active) {
        await supabase
          .from('freshdesk_config')
          .update({ is_active: false })
          .neq('id', '');
      }

      const { error } = await supabase
        .from('freshdesk_config')
        .insert([config]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Freshdesk configuration saved successfully",
      });
      return true;
    } catch (error) {
      console.error('Error saving Freshdesk config:', error);
      toast({
        title: "Error",
        description: "Failed to save Freshdesk configuration",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateFreshdeskConfig = async (id: string, config: Partial<FreshdeskConfig>): Promise<boolean> => {
    try {
      if (config.is_active) {
        await supabase
          .from('freshdesk_config')
          .update({ is_active: false })
          .neq('id', id);
      }

      const { error } = await supabase
        .from('freshdesk_config')
        .update(config)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Freshdesk configuration updated successfully",
      });
      return true;
    } catch (error) {
      console.error('Error updating Freshdesk config:', error);
      toast({
        title: "Error",
        description: "Failed to update Freshdesk configuration",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteFreshdeskConfig = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('freshdesk_config')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Freshdesk configuration deleted successfully",
      });
      return true;
    } catch (error) {
      console.error('Error deleting Freshdesk config:', error);
      toast({
        title: "Error",
        description: "Failed to delete Freshdesk configuration",
        variant: "destructive",
      });
      return false;
    }
  };

  const testFreshdeskConnection = async (domain: string, apiKey: string): Promise<boolean> => {
    try {
      const response = await fetch(`https://${domain}.freshdesk.com/api/v2/tickets?per_page=1`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`${apiKey}:X`)}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Freshdesk connection test successful",
        });
        return true;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Freshdesk test failed:', error);
      toast({
        title: "Error",
        description: "Freshdesk connection test failed",
        variant: "destructive",
      });
      return false;
    }
  };

  const fetchFreshdeskTickets = async (activeFreshdesk: FreshdeskConfig): Promise<FreshdeskTicket[]> => {
    if (!activeFreshdesk) {
      toast({
        title: "Error",
        description: "No active Freshdesk configuration found",
        variant: "destructive",
      });
      return [];
    }

    try {
      const { data, error } = await supabase.functions.invoke('freshdesk-proxy', {
        body: {
          endpoint: '/tickets',
          method: 'GET'
        }
      });

      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (data && Array.isArray(data)) {
        toast({
          title: "Success",
          description: "Tickets fetched successfully",
        });
        return data;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tickets from Freshdesk",
        variant: "destructive",
      });
      return [];
    }
  };

  const createFreshdeskTicket = async (ticketData: any): Promise<FreshdeskTicket | null> => {
    const activeFreshdesk = await getActiveFreshdeskConfig();
    
    if (!activeFreshdesk) {
      toast({
        title: "Error",
        description: "No active Freshdesk configuration found",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('freshdesk-proxy', {
        body: {
          endpoint: '/tickets',
          method: 'POST',
          body: ticketData
        }
      });

      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (data && data.id) {
        toast({
          title: "Success",
          description: `Ticket #${data.id} created successfully`,
        });
        return data;
      } else {
        throw new Error('Invalid response from Freshdesk');
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
      toast({
        title: "Error",
        description: `Failed to create ticket in Freshdesk: ${error.message}`,
        variant: "destructive",
      });
      return null;
    }
  };

  const getActiveFreshdeskConfig = async (): Promise<FreshdeskConfig | null> => {
    try {
      const { data, error } = await supabase
        .from('freshdesk_config')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching active Freshdesk config:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting active Freshdesk config:', error);
      return null;
    }
  };

  const updateFreshdeskTicket = async (ticketId: number, ticketData: any): Promise<boolean> => {
    const activeFreshdesk = await getActiveFreshdeskConfig();
    
    if (!activeFreshdesk) {
      toast({
        title: "Error",
        description: "No active Freshdesk configuration found",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('freshdesk-proxy', {
        body: {
          endpoint: `/tickets/${ticketId}`,
          method: 'PUT',
          body: ticketData
        }
      });

      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }

      toast({
        title: "Success",
        description: "Ticket updated successfully",
      });
      return true;
    } catch (error) {
      console.error('Failed to update ticket:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket in Freshdesk",
        variant: "destructive",
      });
      return false;
    }
  };

  const fetchTicketConversations = async (activeFreshdesk: FreshdeskConfig, ticketId: number): Promise<FreshdeskConversation[]> => {
    if (!activeFreshdesk) {
      throw new Error('No active Freshdesk configuration found');
    }

    try {
      const { data, error } = await supabase.functions.invoke('freshdesk-proxy', {
        body: {
          endpoint: `/tickets/${ticketId}/conversations`,
          method: 'GET'
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
      console.error('Failed to fetch ticket conversations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch ticket conversations",
        variant: "destructive",
      });
      throw error;
    }
  };

  const addNoteToTicket = async (activeFreshdesk: FreshdeskConfig, ticketId: number, noteData: CreateNoteData): Promise<boolean> => {
    if (!activeFreshdesk) {
      toast({
        title: "Error",
        description: "No active Freshdesk configuration found",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('freshdesk-proxy', {
        body: {
          endpoint: `/tickets/${ticketId}/notes`,
          method: 'POST',
          body: noteData
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Success",
        description: "Note added successfully",
      });
      return true;
    } catch (error) {
      console.error('Failed to add note to ticket:', error);
      toast({
        title: "Error",
        description: "Failed to add note to ticket",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    saveFreshdeskConfig,
    updateFreshdeskConfig,
    deleteFreshdeskConfig,
    testFreshdeskConnection,
    fetchFreshdeskTickets,
    createFreshdeskTicket,
    updateFreshdeskTicket,
    fetchTicketConversations,
    addNoteToTicket,
  };
};
