
import React from 'react';

interface CodeBlockProps {
  content: string[];
  language?: string;
  keyPrefix: string;
}

const CodeBlock = ({ content, language, keyPrefix }: CodeBlockProps) => {
  return (
    <div className="my-3">
      <pre className="bg-gray-100 border border-gray-200 rounded-lg p-4 overflow-x-auto">
        <code className="text-sm font-mono text-gray-800 leading-relaxed">
          {content.join('\n')}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;
