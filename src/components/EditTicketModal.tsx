
import React, { useState } from 'react';
import { Edit, Loader2 } from 'lucide-react';
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
import { useConfig } from '@/contexts/ConfigContext';
import { useToast } from '@/hooks/use-toast';
import EditTicketFormFields from './editTicket/EditTicketFormFields';
import EditTicketStatusFields from './editTicket/EditTicketStatusFields';

interface FreshdeskTicket {
  id: number;
  subject: string;
  description_text: string;
  status: number;
  priority: number;
  requester_id: number;
  responder_id?: number;
  group_id?: number;
}

interface EditTicketModalProps {
  ticket: FreshdeskTicket;
  onTicketUpdated?: () => void;
}

const EditTicketModal = ({ ticket, onTicketUpdated }: EditTicketModalProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: ticket.subject,
    description: ticket.description_text,
    status: ticket.status.toString(),
    priority: ticket.priority.toString(),
    responder_id: ticket.responder_id?.toString() || '',
    group_id: ticket.group_id?.toString() || '',
  });

  const { updateFreshdeskTicket } = useConfig();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const ticketData = {
        subject: formData.subject,
        description: formData.description,
        status: parseInt(formData.status),
        priority: parseInt(formData.priority),
        ...(formData.responder_id && { responder_id: parseInt(formData.responder_id) }),
        ...(formData.group_id && { group_id: parseInt(formData.group_id) }),
      };

      const success = await updateFreshdeskTicket(ticket.id, ticketData);
      
      if (success) {
        setOpen(false);
        onTicketUpdated?.();
        toast({
          title: "Success",
          description: "Ticket updated successfully",
        });
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Ticket #{ticket.id}</DialogTitle>
          <DialogDescription>
            Update the ticket details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <EditTicketFormFields
              formData={formData}
              onFormDataChange={setFormData}
            />
            <EditTicketStatusFields
              formData={formData}
              onFormDataChange={setFormData}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Ticket
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTicketModal;
