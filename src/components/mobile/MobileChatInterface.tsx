import { useState, useEffect, useRef } from 'react';
import { useConfig } from '@/contexts/ConfigContext';
import { useGuestMode } from '@/hooks/useGuestMode';
import { GuestChatInterface } from './GuestChatInterface';
import { MobileChatComposer } from './MobileChatComposer';
import { MobileChatMessage } from './MobileChatMessage';
import { NewChatSheet } from './NewChatSheet';
import { MobileCustomerInfoSheet } from './MobileCustomerInfoSheet';
import EmptyChatState from '@/components/chat/EmptyChatState';
import ChatTypingIndicator from '@/components/chat/ChatTypingIndicator';
import { Button } from '@/components/ui/button';
import { ArrowDown, MoreVertical, Info, RefreshCw, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { parseWebhookResponse } from '@/services/chatService';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const MobileChatInterface = () => {
  const { isGuest } = useGuestMode();
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showNewChatSheet, setShowNewChatSheet] = useState(false);
  const [showCustomerInfoSheet, setShowCustomerInfoSheet] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { isOnline, networkSpeed } = useNetworkStatus();

  // Show guest interface for unauthenticated users
  if (isGuest) {
    return <GuestChatInterface />;
  }

  const {
    currentChatSession,
    chatMessages,
    loadChatMessages,
    addChatMessage,
    currentChatType,
    activeSupportWebhook,
    activeGeneralWebhook,
    customerInfo,
    setCustomerInfo,
    saveCustomerInfo,
  } = useConfig();

  const currentWebhook = currentChatType === 'support' ? activeSupportWebhook : activeGeneralWebhook;

  useEffect(() => {
    if (currentChatSession?.id) {
      loadChatMessages(currentChatSession.id);
    }
  }, [currentChatSession?.id, loadChatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
    setShowScrollButton(!isNearBottom);
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    if (!currentWebhook) {
      toast.error(`Please configure a ${currentChatType} webhook in Settings`);
      return;
    }

    setIsLoading(true);
    
    try {
      const sessionId = currentChatSession?.id;
      if (!sessionId) {
        toast.error('No active chat session');
        return;
      }

      // Add user message
      await addChatMessage(sessionId, message, 'user');

      // Send to webhook directly
      const response = await fetch(currentWebhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          customer_info: currentChatType === 'support' ? customerInfo : undefined,
        }),
      });

      if (!response.ok) throw new Error('Webhook request failed');

      const data = await response.text();
      
      // Parse webhook response - try JSON first, then plain text
      let botResponse: string;
      try {
        const jsonData = JSON.parse(data);
        botResponse = jsonData.response?.text || jsonData.response || jsonData.message || data;
      } catch {
        botResponse = data;
      }

      // Add bot response
      await addChatMessage(sessionId, botResponse, 'bot');
      
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCustomerInfo = async () => {
    await saveCustomerInfo();
    toast.success('Customer information saved');
    setShowCustomerInfoSheet(false);
  };

  const handleRefreshMessages = async () => {
    if (currentChatSession?.id) {
      await loadChatMessages(currentChatSession.id);
    }
  };

  // Pull to refresh
  const pullToRefresh = usePullToRefresh({
    onRefresh: handleRefreshMessages,
    threshold: 80,
  });

  // Show new chat sheet if no session
  if (!currentChatSession) {
    return (
      <>
        <div className="h-screen-safe flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-muted/20">
          <EmptyChatState hasSession={false} />
        </div>
        <NewChatSheet 
          open={showNewChatSheet} 
          onOpenChange={setShowNewChatSheet}
        />
      </>
    );
  }

  return (
    <div className="h-screen-safe flex flex-col bg-background">
      {/* Network Status Banner */}
      {!isOnline && (
        <div className="bg-destructive text-destructive-foreground px-4 py-2 text-sm text-center flex items-center justify-center gap-2">
          <WifiOff className="h-4 w-4" />
          You're offline. Some features may not be available.
        </div>
      )}
      
      {isOnline && networkSpeed === 'slow' && (
        <div className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 px-4 py-2 text-xs text-center">
          Slow network detected. Messages may take longer to send.
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between h-14 px-4 bg-background border-b pt-[env(safe-area-inset-top)]">
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold truncate">
            {currentChatSession.title || 'New Conversation'}
          </h1>
          {currentChatType === 'support' && customerInfo.customerName && (
            <p className="text-xs text-muted-foreground truncate">
              {customerInfo.customerName}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {currentChatType === 'support' && (
            <Button
              variant="ghost"
              size="icon"
              className="min-touch-target"
              onClick={() => setShowCustomerInfoSheet(true)}
            >
              <Info className="h-5 w-5" />
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="min-touch-target">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowNewChatSheet(true)}>
                New Chat
              </DropdownMenuItem>
              <DropdownMenuItem>Export Chat</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Delete Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Pull to Refresh Indicator */}
      {pullToRefresh.pullDistance > 0 && (
        <div 
          className="flex items-center justify-center py-2 bg-primary/10"
          style={{
            height: `${pullToRefresh.pullDistance}px`,
            transition: pullToRefresh.isRefreshing ? 'height 0.2s' : 'none'
          }}
        >
          <RefreshCw 
            className={cn(
              "h-5 w-5 text-primary",
              pullToRefresh.isRefreshing && "animate-spin",
              pullToRefresh.isReady && !pullToRefresh.isRefreshing && "scale-110"
            )}
          />
        </div>
      )}

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        onTouchStart={pullToRefresh.handleTouchStart}
        onTouchMove={pullToRefresh.handleTouchMove}
        onTouchEnd={pullToRefresh.handleTouchEnd}
        className="flex-1 overflow-y-auto overflow-x-hidden"
      >
        <div className="flex flex-col min-h-full px-4 py-4 gap-3">
          {chatMessages.length === 0 && (
            <div className="flex items-center justify-center h-full text-center text-muted-foreground">
              <p>Start the conversation by sending a message below</p>
            </div>
          )}
          
          {chatMessages.map((msg) => (
            <MobileChatMessage key={msg.id} message={msg} />
          ))}
          
          {isLoading && <ChatTypingIndicator />}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll to Bottom FAB */}
      {showScrollButton && (
        <Button
          size="icon"
          className="absolute bottom-20 right-4 rounded-full shadow-lg z-20 min-touch-target"
          onClick={scrollToBottom}
        >
          <ArrowDown className="h-5 w-5" />
        </Button>
      )}

      {/* Composer - Add padding to avoid bottom nav overlap */}
      <div className="flex-shrink-0 border-t bg-background pb-16">
        <MobileChatComposer 
          onSendMessage={sendMessage}
          disabled={isLoading || !isOnline}
          isLoading={isLoading}
        />
      </div>

      {/* Modals */}
      <NewChatSheet 
        open={showNewChatSheet} 
        onOpenChange={setShowNewChatSheet}
      />
      
      {currentChatType === 'support' && (
        <MobileCustomerInfoSheet
          open={showCustomerInfoSheet}
          onOpenChange={setShowCustomerInfoSheet}
          customerInfo={customerInfo}
          onCustomerInfoChange={setCustomerInfo}
          onSave={handleSaveCustomerInfo}
        />
      )}
    </div>
  );
};
