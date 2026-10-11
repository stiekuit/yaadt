
import React from 'react';
import { processInlineCode } from '../utils/textProcessing';
import InlineCode from './InlineCode';

interface MessageContentProps {
  content: string;
  keyPrefix: string;
}

const MessageContent = ({ content, keyPrefix }: MessageContentProps) => {
  const processedContent = processInlineCode(content);
  
  return (
    <p className="text-sm leading-relaxed">
      {processedContent.map((part) => {
        if (part.type === 'code') {
          return <InlineCode key={part.key} content={part.content} keyIndex={part.key} />;
        }
        return (
          <span key={part.key} dangerouslySetInnerHTML={{ __html: part.content }} />
        );
      })}
    </p>
  );
};

export default MessageContent;
