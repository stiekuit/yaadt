import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Sparkles } from 'lucide-react';
import { useConfig } from '@/contexts/ConfigContext';
import { useToast } from '@/hooks/use-toast';
import { formatTicketDescription } from '@/utils/ticketFormatting';

interface CreateTicketModalProps {
  onTicketCreated?: () => void;
  initialData?: {
    subject?: string;
    description?: string;
    customer?: string;
    customerNumber?: string;
    customerGroup?: string;
  };
}

const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ onTicketCreated, initialData }) => {
  const { getCategoriesByParent, getCategoryPath, createFreshdeskTicket, activeFreshdesk } = useConfig();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: initialData?.customer || '',
    contactNumber: initialData?.customerNumber || '',
    customerGroup: initialData?.customerGroup || '',
    deviceSerialNumber: '',
    subject: initialData?.subject || '',
    description: initialData?.description || '',
    email: '',
    priority: '2',
    status: '2',
    selectedCategories: [] as string[],
  });

  const handleCategorySelect = (level: number, categoryId: string) => {
    const newCategories = formData.selectedCategories.slice(0, level);
    newCategories[level] = categoryId;
    setFormData({ ...formData, selectedCategories: newCategories });
  };

  const handleSummarizeDescription = async () => {
    if (!formData.description.trim()) return;

    setIsLoading(true);
    try {
      const summaryResponse = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'summarize_content',
          content: formData.description,
        }),
      });

      if (summaryResponse.ok) {
        const summary = await summaryResponse.text();
        setFormData({ ...formData, description: summary });
      }
    } catch (error) {
      console.error('Error summarizing description:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.description || !formData.email) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in subject, description, and email fields.",
        variant: "destructive",
      });
      return;
    }

    if (!activeFreshdesk) {
      toast({
        title: "No Freshdesk Configuration",
        description: "Please configure Freshdesk in Settings first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Format the ticket description with HTML
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

      console.log('Sending ticket data to Freshdesk:', ticketData);

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
          selectedCategories: [],
        });
        setIsOpen(false);
        onTicketCreated?.();
        toast({
          title: "Success",
          description: "Ticket created successfully!",
        });
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Failed to Create Ticket",
        description: `Error: ${error.message || 'Unknown error occurred'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderCategorySelectors = () => {
    const selectors = [];
    let currentLevel = 0;
    let parentId: string | null = null;

    while (true) {
      const categories = getCategoriesByParent(parentId);
      if (categories.length === 0) break;

      const currentSelection = formData.selectedCategories[currentLevel];
      
      selectors.push(
        <div key={currentLevel}>
          <Label>{currentLevel === 0 ? 'Category' : `Level ${currentLevel + 1}`}</Label>
          <Select 
            value={currentSelection || ''} 
            onValueChange={(value) => handleCategorySelect(currentLevel, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${currentLevel === 0 ? 'category' : 'option'}`} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

      if (!currentSelection) break;
      parentId = currentSelection;
      currentLevel++;
    }

    return selectors;
  };

  const showTemplate = !activeFreshdesk;
  const isFromChat = Boolean(initialData?.description);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={showTemplate ? "outline" : "default"} size="sm">
          <FileText className="w-4 h-4 mr-2" />
          {showTemplate ? 'View Ticket Template' : 'Create Ticket'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {showTemplate ? 'Ticket Creation Template' : 'Create New Support Ticket'}
            {isFromChat && <span className="text-sm font-normal text-blue-600 ml-2">(From Chat)</span>}
          </DialogTitle>
          {showTemplate && (
            <p className="text-sm text-gray-600">
              This is a preview of the ticket creation form. Configure Freshdesk in Settings to enable ticket creation.
            </p>
          )}
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                disabled={showTemplate}
              />
            </div>
            <div>
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                disabled={showTemplate}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerGroup">Customer Group</Label>
              <Select 
                value={formData.customerGroup} 
                onValueChange={(value) => setFormData({ ...formData, customerGroup: value })}
                disabled={showTemplate}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Basic">Basic</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                  <SelectItem value="Government">Government</SelectItem>
                  <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="deviceSerial">Device Serial Number</Label>
              <Input
                id="deviceSerial"
                value={formData.deviceSerialNumber}
                onChange={(e) => setFormData({ ...formData, deviceSerialNumber: e.target.value })}
                disabled={showTemplate}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={showTemplate}
            />
          </div>

          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              disabled={showTemplate}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {renderCategorySelectors()}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="description">Description *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSummarizeDescription}
                disabled={!formData.description.trim() || isLoading || showTemplate}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Summarize Content
              </Button>
            </div>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              placeholder="Describe the customer's issue in detail..."
              required
              disabled={showTemplate}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
                disabled={showTemplate}
              >
                <SelectTrigger>
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

            <div>
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                disabled={showTemplate}
              >
                <SelectTrigger>
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              {showTemplate ? 'Close' : 'Cancel'}
            </Button>
            {!showTemplate && (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Ticket'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTicketModal;
