import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, AlertCircle, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MobileChatComposer } from './MobileChatComposer';
import { MobileChatMessage } from './MobileChatMessage';
import { useConfig } from '@/contexts/ConfigContext';
import ChatTypingIndicator from '@/components/chat/ChatTypingIndicator';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

interface GuestMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  created_at: string;
}

export const GuestChatInterface = () => {
  const navigate = useNavigate();
  const { activeWebhook } = useConfig();
  const supportWebhook = activeWebhook?.url;
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { isOnline, networkSpeed } = useNetworkStatus();
  const isSlowConnection = networkSpeed === 'slow';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRefresh = async () => {
    // For guests, just clear messages
    setMessages([]);
  };

  const { isRefreshing } = usePullToRefresh({
    onRefresh: handleRefresh,
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  const sendMessage = async (message: string) => {
    if (!supportWebhook) {
      const errorMessage: GuestMessage = {
        id: Date.now().toString(),
        message: 'Chat is not configured for guest access. Please sign in to continue.',
        sender: 'bot',
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage: GuestMessage = {
      id: Date.now().toString(),
      message,
      sender: 'user',
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(supportWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.text();
      
      // Try to parse as JSON first, then extract the text
      let messageText = data;
      try {
        const jsonData = JSON.parse(data);
        if (jsonData.response?.text) {
          messageText = jsonData.response.text;
        } else if (jsonData.response) {
          messageText = jsonData.response;
        } else if (jsonData.message) {
          messageText = jsonData.message;
        }
      } catch {
        // If not JSON, use the raw text
        messageText = data;
      }
      
      const botMessage: GuestMessage = {
        id: (Date.now() + 1).toString(),
        message: messageText || 'Thank you for your message!',
        sender: 'bot',
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: GuestMessage = {
        id: (Date.now() + 1).toString(),
        message: 'Sorry, I encountered an error connecting to support. Please try again or sign in for assistance.',
        sender: 'bot',
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Network Status Banners */}
      {!isOnline && (
        <div className="bg-destructive text-destructive-foreground px-4 py-2 text-sm text-center">
          No internet connection. Messages will be sent when you're back online.
        </div>
      )}
      {isOnline && isSlowConnection && (
        <div className="bg-warning/10 text-warning-foreground px-4 py-2 text-sm text-center border-b border-warning/20">
          Slow connection detected. Messages may take longer to send.
        </div>
      )}

      {/* Sign-in Banner */}
      <div className="bg-primary/10 border-b border-primary/20 p-3 flex-shrink-0">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary">
              Guest Mode - Chat history not saved
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sign in to save your conversations and access tickets
            </p>
          </div>
          <Button 
            size="sm" 
            onClick={() => navigate('/auth')}
            className="flex-shrink-0"
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Sign In
          </Button>
        </div>
      </div>

      {/* Pull to Refresh Indicator */}
      {isRefreshing && (
        <div className="bg-muted/50 py-2 text-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
        </div>
      )}

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="bg-primary/10 rounded-full p-4 mb-4">
              <AlertCircle className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Welcome to Guest Mode</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Start a conversation to get support. Your messages won't be saved.
            </p>
            <Button onClick={() => navigate('/auth')} variant="outline">
              <UserPlus className="w-4 h-4 mr-2" />
              Sign In to Save History
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map(msg => (
              <MobileChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && <ChatTypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-6 bg-primary text-primary-foreground rounded-full p-3 shadow-lg z-10 hover:bg-primary/90 transition-all"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      )}

      {/* Chat Composer - Add padding to avoid bottom nav overlap */}
      <div className="flex-shrink-0 border-t bg-background pb-16">
        <MobileChatComposer onSendMessage={sendMessage} disabled={!isOnline} isLoading={isLoading} />
      </div>
    </div>
  );
};
