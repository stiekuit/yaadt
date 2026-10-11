
import React, { useState } from 'react';
import { Download, Loader2, Eye, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
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

interface ImportTicketModalProps {
  onTicketImported?: (ticketId: string) => void;
}

interface ConversationPreview {
  id: number;
  body_text: string;
  incoming: boolean;
  created_at: string;
  from_email?: string;
  to_emails?: string[];
}

const ImportTicketModal = ({ onTicketImported }: ImportTicketModalProps) => {
  const [open, setOpen] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const { fetchTicketConversations, activeFreshdesk, addChatMessage, currentChatSession } = useConfig();
  const { toast } = useToast();

  const resetModal = () => {
    setTicketId('');
    setConversations([]);
    setShowPreview(false);
    setIsLoading(false);
    setIsImporting(false);
  };

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticketId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a ticket ID",
        variant: "destructive",
      });
      return;
    }

    if (!activeFreshdesk) {
      toast({
        title: "Error",
        description: "No Freshdesk configuration found",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const fetchedConversations = await fetchTicketConversations(parseInt(ticketId));
      
      if (fetchedConversations && fetchedConversations.length > 0) {
        setConversations(fetchedConversations);
        setShowPreview(true);
        toast({
          title: "Preview Ready",
          description: `Found ${fetchedConversations.length} conversations to import`,
        });
      } else {
        toast({
          title: "No Data",
          description: "No conversations found for this ticket ID",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching ticket conversations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch ticket conversations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!currentChatSession) {
      toast({
        title: "Error",
        description: "No active chat session",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      for (const conversation of conversations) {
        const sender = conversation.incoming ? 'user' : 'bot';
        const message = conversation.body_text || 'No content';
        
        await addChatMessage(currentChatSession.id, message, sender);
      }

      toast({
        title: "Success",
        description: `Imported ${conversations.length} messages from ticket #${ticketId}`,
      });

      onTicketImported?.(ticketId);
      setOpen(false);
      resetModal();
    } catch (error) {
      console.error('Error importing conversations:', error);
      toast({
        title: "Error",
        description: "Failed to import conversations",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    resetModal();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Import Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Import Ticket Conversations</DialogTitle>
          <DialogDescription>
            {!showPreview 
              ? "Enter a ticket ID to preview its conversation history before importing."
              : `Preview of ${conversations.length} conversations from ticket #${ticketId}`
            }
          </DialogDescription>
        </DialogHeader>
        
        {!showPreview ? (
          <form onSubmit={handlePreview} className="space-y-4">
            <div>
              <Label htmlFor="ticketId">Ticket ID</Label>
              <Input
                id="ticketId"
                type="number"
                placeholder="e.g. 12345"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <DialogFooter className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !ticketId.trim()}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Eye className="w-4 h-4 mr-2" />
                Preview Conversations
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <MessageSquare className="w-3 h-3" />
                <span>{conversations.length} conversations</span>
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowPreview(false)}
              >
                ← Back to Search
              </Button>
            </div>
            
            <ScrollArea className="h-[300px] w-full border rounded-md p-4">
              <div className="space-y-3">
                {conversations.map((conv, index) => (
                  <div 
                    key={conv.id || index} 
                    className={`p-3 rounded-lg border ${
                      conv.incoming 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={conv.incoming ? "default" : "secondary"}>
                        {conv.incoming ? "Customer" : "Agent"}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatDate(conv.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {conv.body_text || "No content"}
                    </p>
                    {conv.from_email && (
                      <p className="text-xs text-gray-500 mt-1">
                        From: {conv.from_email}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <DialogFooter className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmImport} 
                disabled={isImporting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Download className="w-4 h-4 mr-2" />
                Confirm Import
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImportTicketModal;
