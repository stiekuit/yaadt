
import { useState } from 'react';
import { useConfig } from '@/contexts/ConfigContext';
import { useToast } from '@/hooks/use-toast';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import ChatSidebar from './chat/ChatSidebar';
import ChatHeader from './chat/ChatHeader';
import ChatMessageList from './chat/ChatMessageList';
import ChatInput from './chat/ChatInput';
import CustomerInfoInput from './chat/CustomerInfoInput';
import { parseWebhookResponse, generateChatTitle } from '@/services/chatService';

const ChatInterface = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const { 
    activeWebhook, 
    activeSupportWebhook,
    activeGeneralWebhook,
    webhookConfigs, 
    currentChatType,
    chatSessions, 
    currentChatSession, 
    chatMessages,
    customerInfo,
    setCustomerInfo,
    saveCustomerInfo,
    createChatSession,
    loadChatMessages,
    setCurrentChatSession,
    addChatMessage,
    updateChatSessionTitle,
    deleteChatSession,
    loadChatSessions
  } = useConfig();
  const { toast } = useToast();

  // Select the correct webhook based on current chat type
  const currentWebhook = currentChatType === 'general' ? activeGeneralWebhook : activeSupportWebhook;

  console.log('🔗 ChatInterface webhook selection:', {
    currentChatType,
    activeSupportWebhook: activeSupportWebhook?.name,
    activeGeneralWebhook: activeGeneralWebhook?.name,
    selectedWebhook: currentWebhook?.name,
    currentSessionType: currentChatSession?.chat_type,
    totalSessions: chatSessions.length
  });

  const handleNewChat = async () => {
    const newSession = await createChatSession();
    if (newSession) {
      setCurrentChatSession(newSession);
      await loadChatSessions();
    }
  };

  const handleChatSelect = async (session: typeof chatSessions[0]) => {
    // Validate that the session matches the current chat type
    if (session.chat_type !== currentChatType) {
      console.warn(`⚠️ Cannot select ${session.chat_type} session while in ${currentChatType} mode`);
      toast({
        title: "Session Type Mismatch",
        description: `This is a ${session.chat_type} session. Please switch to ${session.chat_type} chat to access it.`,
        variant: "destructive",
      });
      return;
    }

    setCurrentChatSession(session);
    setMessagesLoading(true);
    try {
      await loadChatMessages(session.id);
    } catch (error) {
      console.error('Error loading chat messages:', error);
      toast({
        title: "Error",
        description: "Failed to load chat messages",
        variant: "destructive",
      });
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleDeleteChat = async (sessionId: string) => {
    if (confirm('Are you sure you want to delete this chat session?')) {
      await deleteChatSession(sessionId);
    }
  };

  const handleClearEmptyChats = async () => {
    await loadChatSessions();
  };

  const handleCustomerInfoChange = (info: typeof customerInfo) => {
    setCustomerInfo(info);
  };

  const handleSaveCustomerInfo = async () => {
    try {
      await saveCustomerInfo();
      toast({
        title: "Success",
        description: "Customer information saved successfully",
      });
    } catch (error) {
      console.error('Error saving customer info:', error);
      toast({
        title: "Error",
        description: "Failed to save customer information",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async (userMessageText: string) => {
    if (isLoading) return;

    if (!currentWebhook) {
      toast({
        title: "Configuration Error",
        description: `No active webhook configured for ${currentChatType === 'general' ? 'General Chat' : 'Support Chat'}. Please configure a webhook in Settings.`,
        variant: "destructive",
      });
      return;
    }

    let sessionToUse = currentChatSession;
    if (!currentChatSession) {
      const chatTitle = generateChatTitle(userMessageText);
      sessionToUse = await createChatSession(chatTitle);
      if (!sessionToUse) return;
    }

    // Double-check session type matches current chat type
    if (sessionToUse.chat_type !== currentChatType) {
      console.error(`🚨 Session type mismatch: session is ${sessionToUse.chat_type} but current type is ${currentChatType}`);
      toast({
        title: "Session Error",
        description: "Session type mismatch. Please create a new chat session.",
        variant: "destructive",
      });
      return;
    }

    await addChatMessage(sessionToUse.id, userMessageText, 'user');
    if (sessionToUse.title === 'New Chat' && chatMessages.length === 0) {
      const newTitle = generateChatTitle(userMessageText);
      await updateChatSessionTitle(sessionToUse.id, newTitle);
    }

    setIsLoading(true);

    try {
      console.log('📤 Sending message to webhook:', {
        webhookName: currentWebhook.name,
        webhookUrl: currentWebhook.url,
        chatType: currentChatType,
        sessionId: sessionToUse.id,
        sessionType: sessionToUse.chat_type
      });

      const response = await fetch(currentWebhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessageText,
          timestamp: new Date().toISOString(),
          userId: 'support-portal-user',
          sessionId: sessionToUse.id,
          chatType: currentChatType,
        }),
      });

      let botResponse = 'Thank you for your message. Our support team will get back to you shortly.';
      
      if (response.ok) {
        const responseData = await response.text();
        botResponse = parseWebhookResponse(responseData);
      } else {
        console.error('Webhook response error:', response.status, response.statusText);
        botResponse = 'I apologize, but I encountered an issue processing your request. Please try again or contact support.';
      }

      await addChatMessage(sessionToUse.id, botResponse, 'bot');
    } catch (error) {
      console.error('Error sending message:', error);
      await addChatMessage(
        sessionToUse.id, 
        'Sorry, there was an error processing your message. Please check your network connection and try again.', 
        'bot'
      );
      
      toast({
        title: "Connection Error",
        description: "Failed to send message. Please check your webhook configuration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
          <ChatSidebar 
            chatSessions={chatSessions}
            currentChatSession={currentChatSession}
            activeWebhook={currentWebhook}
            onNewChat={handleNewChat}
            onSelectChat={handleChatSelect}
            onDeleteChat={handleDeleteChat}
            onClearEmptyChats={handleClearEmptyChats}
          />
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={70} minSize={50}>
          <div className="flex flex-col h-full bg-white">
            <ChatHeader 
              currentChatSession={currentChatSession}
              chatMessages={chatMessages}
              currentChatType={currentChatType}
              customerInfo={currentChatType === 'support' ? customerInfo : undefined}
            />
            
            {currentChatType === 'support' && (
              <div className="px-6 pt-2">
                <CustomerInfoInput
                  customerInfo={customerInfo}
                  onCustomerInfoChange={handleCustomerInfoChange}
                  onSave={handleSaveCustomerInfo}
                  isCollapsed={true}
                />
              </div>
            )}
            
            <ChatMessageList 
              chatMessages={chatMessages}
              isLoading={isLoading || messagesLoading}
              currentChatSession={currentChatSession}
            />

            <ChatInput 
              onSendMessage={sendMessage}
              isLoading={isLoading}
              isDisabled={!currentWebhook}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ChatInterface;
