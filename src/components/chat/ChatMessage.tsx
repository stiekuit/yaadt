
import React from 'react';
import MessageAvatar from './components/MessageAvatar';
import MessageContent from './components/MessageContent';
import CodeBlock from './components/CodeBlock';
import ListItems from './components/ListItems';
import { useMessageFormatter } from './hooks/useMessageFormatter';

interface ChatMessageProps {
  message: {
    id: string;
    sender: 'user' | 'bot';
    message: string;
    created_at: string;
  };
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const { formatMessage } = useMessageFormatter();
  const isUser = message.sender === 'user';

  const renderElement = (element: any) => {
    switch (element.type) {
      case 'code':
        return (
          <CodeBlock
            key={element.key}
            content={element.content.lines}
            language={element.content.language}
            keyPrefix={element.key}
          />
        );
      case 'list':
        return (
          <ListItems
            key={element.key}
            items={element.content}
            type="unordered"
            keyPrefix={element.key}
          />
        );
      case 'orderedList':
        return (
          <ListItems
            key={element.key}
            items={element.content}
            type="ordered"
            keyPrefix={element.key}
          />
        );
      case 'text':
        return (
          <MessageContent
            key={element.key}
            content={element.content}
            keyPrefix={element.key}
          />
        );
      default:
        return null;
    }
  };

  const formattedParagraphs = formatMessage(message.message);

  return (
    <div className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <MessageAvatar isUser={isUser} />

      {/* Message Content */}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Message Bubble */}
        <div className={`px-4 py-3 rounded-2xl shadow-sm border ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md border-blue-600'
            : 'bg-white text-gray-800 rounded-bl-md border-gray-200 shadow-md'
        }`}>
          <div className="leading-relaxed">
            {formattedParagraphs.map((paragraph) => (
              <div 
                key={paragraph.paragraphIndex} 
                className={paragraph.paragraphIndex > 0 ? 'mt-3' : ''}
              >
                {paragraph.elements.map(renderElement)}
              </div>
            ))}
          </div>
        </div>

        {/* Timestamp */}
        <div className={`mt-1 px-2 ${isUser ? 'text-right' : 'text-left'}`}>
          <span className="text-xs text-gray-500 font-medium">
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
