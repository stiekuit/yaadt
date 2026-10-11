import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip } from 'lucide-react';
import { useKeyboardAvoidance } from '@/hooks/useKeyboardAvoidance';
import { useGuestMode } from '@/hooks/useGuestMode';

interface MobileChatComposerProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const MobileChatComposer = ({
  onSendMessage,
  disabled = false,
  isLoading = false,
}: MobileChatComposerProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isKeyboardVisible, keyboardHeight } = useKeyboardAvoidance();
  const { isGuest } = useGuestMode();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 5 * 24; // 5 lines max
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (!message.trim() || disabled || isLoading) return;
    
    onSendMessage(message);
    setMessage('');
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div 
      className="sticky bottom-0 bg-background border-t px-3 py-2 transition-all duration-200"
      style={{ 
        paddingBottom: isKeyboardVisible 
          ? `${Math.max(keyboardHeight, 8)}px` 
          : 'calc(env(safe-area-inset-bottom) + 8px)' 
      }}
    >
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        {/* Attach Button */}
        <Button
          variant="ghost"
          size="icon"
          className="min-touch-target flex-shrink-0 mb-1"
          disabled={disabled}
          aria-label="Attach file"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* Message Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              disabled && !isGuest 
                ? "Configure webhook to chat..." 
                : "Type a message..."
            }
            disabled={disabled || isLoading}
            className="min-h-[44px] max-h-[120px] resize-none rounded-3xl pr-3 py-3 text-base leading-relaxed bg-muted/50 border-muted focus-visible:ring-primary"
            rows={1}
            aria-label="Message input"
            aria-describedby="message-hint"
          />
        </div>

        {/* Send Button */}
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!message.trim() || disabled || isLoading}
          className="min-touch-target rounded-full flex-shrink-0 mb-1"
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
