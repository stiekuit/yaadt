import { useMemo } from 'react';
import { useMessageFormatter } from '@/components/chat/hooks/useMessageFormatter';
import MessageAvatar from '@/components/chat/components/MessageAvatar';
import CodeBlock from '@/components/chat/components/CodeBlock';
import MessageContent from '@/components/chat/components/MessageContent';
import ListItems from '@/components/chat/components/ListItems';
import { format } from 'date-fns';

interface MobileChatMessageProps {
  message: {
    id: string;
    sender: 'user' | 'bot';
    message: string;
    created_at: string;
  };
}

export const MobileChatMessage = ({ message }: MobileChatMessageProps) => {
  const isUser = message.sender === 'user';
  const { formatMessage } = useMessageFormatter();
  const formattedParagraphs = formatMessage(message.message);

  const renderElement = (element: any, index: number) => {
    const keyPrefix = `${message.id}-${index}`;

    switch (element.type) {
      case 'code':
        return <CodeBlock key={keyPrefix} content={element.content} language={element.language} keyPrefix={keyPrefix} />;
      case 'list':
        return <ListItems key={keyPrefix} items={element.content} type="unordered" keyPrefix={keyPrefix} />;
      case 'orderedList':
        return <ListItems key={keyPrefix} items={element.content} type="ordered" keyPrefix={keyPrefix} />;
      case 'text':
        return <MessageContent key={keyPrefix} content={element.content} keyPrefix={keyPrefix} />;
      default:
        return null;
    }
  };

  const formattedTime = useMemo(() => {
    try {
      return format(new Date(message.created_at), 'HH:mm');
    } catch {
      return '';
    }
  }, [message.created_at]);

  return (
    <div className={`flex gap-2 items-end animate-in fade-in slide-in-from-bottom-2 duration-300 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <MessageAvatar isUser={isUser} />
      </div>

      {/* Message Bubble */}
      <div className={`flex flex-col max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 shadow-sm ${
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-muted text-foreground rounded-bl-sm'
          }`}
        >
          <div className="space-y-2">
            {formattedParagraphs.map((para) =>
              para.elements.map((element, index) => renderElement(element, index))
            )}
          </div>
        </div>

        {/* Timestamp */}
        {formattedTime && (
          <span className={`text-xs text-muted-foreground mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {formattedTime}
          </span>
        )}
      </div>
    </div>
  );
};
