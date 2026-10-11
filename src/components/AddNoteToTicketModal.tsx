
import React, { useState } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useConfig } from '@/contexts/ConfigContext';
import { useToast } from '@/hooks/use-toast';

interface AddNoteToTicketModalProps {
  ticketId: number;
  onNoteAdded?: () => void;
}

const AddNoteToTicketModal = ({ ticketId, onNoteAdded }: AddNoteToTicketModalProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    body: '',
    private: false,
  });

  const { addNoteToTicket } = useConfig();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.body.trim()) {
      toast({
        title: "Error",
        description: "Note content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await addNoteToTicket(ticketId, {
        body: formData.body,
        private: formData.private,
      });
      
      if (success) {
        setOpen(false);
        setFormData({ body: '', private: false });
        onNoteAdded?.();
        toast({
          title: "Success",
          description: `${formData.private ? 'Private note' : 'Public reply'} added successfully`,
        });
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({ body: '', private: false });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageSquare className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Note to Ticket #{ticketId}</DialogTitle>
          <DialogDescription>
            Add a note or reply to this ticket. Choose whether it should be private (internal only) or public (visible to customer).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="body">Note Content *</Label>
              <Textarea
                id="body"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Enter your note or reply here..."
                className="min-h-[120px]"
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="private"
                checked={formData.private}
                onCheckedChange={(checked) => setFormData({ ...formData, private: checked })}
              />
              <Label htmlFor="private" className="text-sm">
                Private note (internal only)
              </Label>
            </div>
            
            {formData.private && (
              <p className="text-xs text-gray-500">
                This note will only be visible to agents and will not be sent to the customer.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add {formData.private ? 'Private Note' : 'Public Reply'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNoteToTicketModal;
