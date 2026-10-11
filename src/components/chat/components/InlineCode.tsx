
import React from 'react';

interface InlineCodeProps {
  content: string;
  keyIndex: number;
}

const InlineCode = ({ content, keyIndex }: InlineCodeProps) => {
  return (
    <code 
      key={keyIndex} 
      className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
    >
      {content}
    </code>
  );
};

export default InlineCode;
