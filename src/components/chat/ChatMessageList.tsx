
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from './ChatMessage';
import ChatTypingIndicator from './ChatTypingIndicator';
import EmptyChatState from './EmptyChatState';

interface ChatMessageListProps {
  chatMessages: Array<{
    id: string;
    sender: 'user' | 'bot';
    message: string;
    created_at: string;
  }>;
  isLoading: boolean;
  currentChatSession: { id: string } | null;
}

const ChatMessageList = ({ chatMessages, isLoading, currentChatSession }: ChatMessageListProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [chatMessages]);

  if (!currentChatSession || chatMessages.length === 0) {
    return <EmptyChatState hasSession={!!currentChatSession} />;
  }

  return (
    <ScrollArea className="flex-1 bg-gradient-to-b from-gray-50 to-white" ref={scrollAreaRef}>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {chatMessages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isLoading && <ChatTypingIndicator />}
      </div>
    </ScrollArea>
  );
};

export default ChatMessageList;
