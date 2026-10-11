import { X } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MobileTicketDetailsSheetProps {
  ticket: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTicketUpdated?: () => void;
}

export const MobileTicketDetailsSheet = ({ 
  ticket, 
  open, 
  onOpenChange, 
  onTicketUpdated 
}: MobileTicketDetailsSheetProps) => {
  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 4: return 'Urgent';
      case 3: return 'High';
      case 2: return 'Medium';
      case 1: return 'Low';
      default: return 'Unknown';
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 2: return 'Open';
      case 3: return 'Pending';
      case 4: return 'Resolved';
      case 5: return 'Closed';
      default: return 'Unknown';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[95vh] flex flex-col p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-bold">Ticket #{ticket.id}</h2>
            <p className="text-sm text-muted-foreground">{ticket.subject}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <Tabs defaultValue="details" className="flex-1 flex flex-col">
          <TabsList className="w-full rounded-none border-b border-border">
            <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
            <TabsTrigger value="conversation" className="flex-1">Conversation</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex-1 overflow-y-auto p-4 mt-0">
            <div className="space-y-6">
              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                  <p className="text-sm font-semibold">{getStatusText(ticket.status)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Priority</p>
                  <p className="text-sm font-semibold">{getPriorityText(ticket.priority)}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm whitespace-pre-wrap">{ticket.description_text}</p>
                </div>
              </div>

              {/* Requester Info */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Requester</p>
                <div className="bg-muted rounded-lg p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">ID</span>
                    <span className="text-sm font-medium">{ticket.requester_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm font-medium">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {ticket.updated_at && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Updated</span>
                      <span className="text-sm font-medium">
                        {new Date(ticket.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="conversation" className="flex-1 overflow-y-auto p-4 mt-0">
            <div className="flex items-center justify-center h-full text-center">
              <p className="text-sm text-muted-foreground">
                Conversation history will appear here
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
