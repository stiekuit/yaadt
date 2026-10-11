import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConfig } from '@/contexts/ConfigContext';
import { useToast } from '@/hooks/use-toast';
import { formatTicketDescription } from '@/utils/ticketFormatting';

interface MobileCreateTicketSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTicketCreated?: () => void;
}

export const MobileCreateTicketSheet = ({ open, onOpenChange, onTicketCreated }: MobileCreateTicketSheetProps) => {
  const { createFreshdeskTicket, activeFreshdesk } = useConfig();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    contactNumber: '',
    customerGroup: '',
    deviceSerialNumber: '',
    subject: '',
    description: '',
    email: '',
    priority: '2',
    status: '2',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.description || !formData.email) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in subject, description, and email.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const customerInfo = {
        customerName: formData.customerName,
        customerNumber: formData.contactNumber,
        customerGroup: formData.customerGroup,
        deviceSerialNumber: formData.deviceSerialNumber,
      };

      const formattedDescription = formatTicketDescription(
        formData.description,
        customerInfo
      );

      const ticketData = {
        subject: formData.subject,
        description: formattedDescription,
        email: formData.email,
        priority: parseInt(formData.priority),
        status: parseInt(formData.status),
        type: 'Question',
        source: 2,
      };

      const success = await createFreshdeskTicket(ticketData);
      
      if (success) {
        setFormData({
          customerName: '',
          contactNumber: '',
          customerGroup: '',
          deviceSerialNumber: '',
          subject: '',
          description: '',
          email: '',
          priority: '2',
          status: '2',
        });
        onOpenChange(false);
        onTicketCreated?.();
        toast({
          title: "Success",
          description: "Ticket created successfully!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Failed to Create Ticket",
        description: error.message || 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[95vh] flex flex-col p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold">Create Ticket</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Customer Info Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Customer Information
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="h-12"
                  placeholder="Enter customer name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  className="h-12"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerGroup">Customer Group</Label>
                <Select 
                  value={formData.customerGroup} 
                  onValueChange={(value) => setFormData({ ...formData, customerGroup: value })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select customer group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deviceSerial">Device Serial Number</Label>
                <Input
                  id="deviceSerial"
                  value={formData.deviceSerialNumber}
                  onChange={(e) => setFormData({ ...formData, deviceSerialNumber: e.target.value })}
                  className="h-12"
                  placeholder="Enter serial number"
                />
              </div>
            </div>

            {/* Ticket Details Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Ticket Details
              </h3>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-12"
                  placeholder="customer@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="h-12"
                  placeholder="Brief description of the issue"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  placeholder="Describe the issue in detail..."
                  required
                  className="resize-none"
                />
              </div>
            </div>

            {/* Classification Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Classification
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Low</SelectItem>
                      <SelectItem value="2">Medium</SelectItem>
                      <SelectItem value="3">High</SelectItem>
                      <SelectItem value="4">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">Open</SelectItem>
                      <SelectItem value="3">Pending</SelectItem>
                      <SelectItem value="4">Resolved</SelectItem>
                      <SelectItem value="5">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 p-4 border-t border-border bg-background pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <Button
              type="submit"
              className="w-full h-12"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Ticket'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
