
import { useState } from 'react';
import { useConfig } from '@/contexts/ConfigContext';
import { useToast } from '@/hooks/use-toast';
import { formatTicketDescription } from '@/utils/ticketFormatting';
import { useChatSession } from '@/hooks/useChatSession';

interface CustomerInfo {
  customerName?: string;
  customerNumber?: string;
  customerEmail?: string;
  deviceSerials?: string[];
}

interface TicketFormData {
  subject: string;
  email: string;
  description: string;
  priority: string;
  status: string;
  deviceSerials: string[];
}

interface ChatMessage {
  sender: 'user' | 'bot';
  message: string;
  created_at: string;
}

interface CreatedTicketData {
  id: number;
  subject: string;
  status: number;
  priority: number;
}

export const useTicketCreation = (
  chatMessages: ChatMessage[],
  customerInfo?: CustomerInfo,
  sessionId?: string
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<CreatedTicketData | null>(null);
  const { createFreshdeskTicket, activeFreshdesk } = useConfig();
  const { updateChatSessionTicketId } = useChatSession();
  const { toast } = useToast();

  const generateFormattedDescription = (formData: TicketFormData) => {
    if (chatMessages.length === 0) return formData.description;
    
    const customerInfoFormatted = {
      customerName: customerInfo?.customerName,
      customerEmail: customerInfo?.customerEmail,
      customerNumber: customerInfo?.customerNumber,
      deviceSerials: formData.deviceSerials.filter(serial => serial.trim()),
    };
    
    return formatTicketDescription(
      formData.description,
      customerInfoFormatted,
      chatMessages
    );
  };

  const createTicket = async (formData: TicketFormData): Promise<{ success: boolean; ticketData?: CreatedTicketData }> => {
    if (!activeFreshdesk) {
      toast({
        title: "Error",
        description: "No Freshdesk configuration found",
        variant: "destructive",
      });
      return { success: false };
    }

    setIsLoading(true);

    try {
      const formattedDescription = generateFormattedDescription(formData);

      const ticketData = {
        subject: formData.subject,
        description: formattedDescription,
        email: formData.email,
        priority: parseInt(formData.priority),
        status: parseInt(formData.status),
        type: 'Question',
        source: 7, // Chat source
      };

      const ticket = await createFreshdeskTicket(ticketData);
      
      if (ticket) {
        const createdTicketData: CreatedTicketData = {
          id: ticket.id,
          subject: ticket.subject,
          status: ticket.status,
          priority: ticket.priority,
        };
        
        setCreatedTicket(createdTicketData);
        
        // Update the chat session with the real ticket ID
        if (sessionId) {
          await updateChatSessionTicketId(sessionId, ticket.id.toString());
        }
        
        toast({
          title: "Success",
          description: `Ticket #${ticket.id} created successfully from chat`,
        });
        return { success: true, ticketData: createdTicketData };
      }
      return { success: false };
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to create ticket",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createTicket,
    createdTicket,
    canCreateTicket: !!activeFreshdesk,
  };
};
