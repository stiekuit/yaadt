import { useState } from 'react';
import { useConfig } from '@/contexts/ConfigContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MessageSquare, Headphones, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface NewChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewChatSheet = ({ open, onOpenChange }: NewChatSheetProps) => {
  const [chatType, setChatType] = useState<'support' | 'general'>('support');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');

  const { createChatSession, setCurrentChatType, setCustomerInfo } = useConfig();

  const handleStartChat = async () => {
    setCurrentChatType(chatType);
    
    if (chatType === 'support') {
      setCustomerInfo({
        customerName,
        customerEmail,
        customerNumber,
        deviceSerials: [],
      });
    }

    const session = await createChatSession('New Chat');

    if (session) {
      onOpenChange(false);
      // Reset form
      setCustomerName('');
      setCustomerEmail('');
      setCustomerNumber('');
    } else {
      toast.error('Failed to create chat session');
    }
  };

  const isFormValid = chatType === 'general' || 
    (customerName.trim() && customerEmail.trim() && customerNumber.trim());

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[90vh] rounded-t-3xl p-0"
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-10"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="h-full flex flex-col">
          {/* Header */}
          <SheetHeader className="px-6 pt-8 pb-6 border-b">
            <SheetTitle className="text-2xl font-bold">
              Start a New Conversation
            </SheetTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Choose your conversation type and get started
            </p>
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* Chat Type Selector */}
            <div className="mb-6">
              <Label className="text-base font-semibold mb-4 block">
                Conversation Type
              </Label>
              <RadioGroup value={chatType} onValueChange={(v) => setChatType(v as 'support' | 'general')}>
                <div className="grid gap-3">
                  <label
                    htmlFor="support"
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      chatType === 'support'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="support" id="support" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Headphones className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Support Chat</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Get help with technical issues or product questions
                      </p>
                    </div>
                  </label>

                  <label
                    htmlFor="general"
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      chatType === 'general'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="general" id="general" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        <span className="font-semibold">General Chat</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Casual conversation or general inquiries
                      </p>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </div>

            {/* Customer Info Form (Support Only) */}
            {chatType === 'support' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <Label className="text-base font-semibold">
                  Customer Information
                </Label>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name" className="text-sm mb-1.5 block">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm mb-1.5 block">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm mb-1.5 block">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={customerNumber}
                      onChange={(e) => setCustomerNumber(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="p-6 border-t bg-background pb-[calc(env(safe-area-inset-bottom)+24px)]">
            <Button
              size="lg"
              className="w-full h-12 text-base font-semibold"
              onClick={handleStartChat}
              disabled={!isFormValid}
            >
              Start Chat
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
