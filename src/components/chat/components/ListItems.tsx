
import React from 'react';
import { processInlineCode } from '../utils/textProcessing';
import InlineCode from './InlineCode';

interface ListItemsProps {
  items: string[];
  type: 'unordered' | 'ordered';
  keyPrefix: string;
}

const ListItems = ({ items, type, keyPrefix }: ListItemsProps) => {
  const renderProcessedItem = (item: string, index: number) => {
    const processedItem = processInlineCode(item);
    return (
      <li key={index} className="text-sm leading-relaxed">
        {processedItem.map((part) => {
          if (part.type === 'code') {
            return <InlineCode key={part.key} content={part.content} keyIndex={part.key} />;
          }
          return (
            <span key={part.key} dangerouslySetInnerHTML={{ __html: part.content }} />
          );
        })}
      </li>
    );
  };

  if (type === 'ordered') {
    return (
      <ol className="list-decimal list-inside my-2 space-y-1">
        {items.map((item, i) => renderProcessedItem(item, i))}
      </ol>
    );
  }

  return (
    <ul className="list-disc list-inside my-2 space-y-1">
      {items.map((item, i) => renderProcessedItem(item, i))}
    </ul>
  );
};

export default ListItems;
