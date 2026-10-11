
import React, { useState } from 'react';
import { Ticket, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import CustomerInfoDisplay from './createTicket/CustomerInfoDisplay';
import TicketFormFields from './createTicket/TicketFormFields';
import ChatHistoryPreview from './createTicket/ChatHistoryPreview';
import { useTicketCreation } from './createTicket/useTicketCreation';

interface CustomerInfo {
  customerName?: string;
  customerNumber?: string;
  customerEmail?: string;
  deviceSerials?: string[];
}

interface CreateTicketFromChatModalProps {
  chatTitle: string;
  chatMessages: Array<{ sender: 'user' | 'bot'; message: string; created_at: string }>;
  customerInfo?: CustomerInfo;
  sessionId?: string;
  onTicketCreated?: (ticketData?: any) => void;
}

const CreateTicketFromChatModal = ({ 
  chatTitle, 
  chatMessages, 
  customerInfo,
  sessionId,
  onTicketCreated 
}: CreateTicketFromChatModalProps) => {
  const [open, setOpen] = useState(false);
  const [createdTicketReference, setCreatedTicketReference] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subject: `Support Request - ${chatTitle}`,
    email: customerInfo?.customerEmail || 'support@example.com',
    description: '',
    priority: '2',
    status: '2',
    deviceSerials: customerInfo?.deviceSerials || [],
  });

  const { isLoading, createTicket, canCreateTicket } = useTicketCreation(chatMessages, customerInfo, sessionId);

  const handleOpen = () => {
    setFormData(prev => ({
      ...prev,
      description: `Additional context or notes about this support request can be added here.`,
      email: customerInfo?.customerEmail || 'support@example.com',
      deviceSerials: customerInfo?.deviceSerials || [],
    }));
    setCreatedTicketReference(null);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await createTicket(formData);
    
    if (result.success && result.ticketData) {
      setCreatedTicketReference(result.ticketData.id.toString());
      onTicketCreated?.(result.ticketData);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setCreatedTicketReference(null);
  };

  if (!canCreateTicket) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleOpen} variant="outline" size="sm">
          <Ticket className="w-4 h-4 mr-2" />
          Create Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Ticket from Chat</DialogTitle>
          <DialogDescription>
            Create a support ticket based on this chat conversation.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <CustomerInfoDisplay 
            customerInfo={customerInfo} 
            ticketReference={createdTicketReference}
          />
          
          {!createdTicketReference && (
            <>
              <TicketFormFields 
                formData={formData}
                onFormDataChange={setFormData}
              />

              <ChatHistoryPreview />
            </>
          )}

          <DialogFooter className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              {createdTicketReference ? 'Close' : 'Cancel'}
            </Button>
            {!createdTicketReference && (
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Ticket
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTicketFromChatModal;
