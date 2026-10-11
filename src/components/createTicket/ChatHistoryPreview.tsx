
import React from 'react';
import { Label } from '@/components/ui/label';

const ChatHistoryPreview = () => {
  return (
    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
      <Label className="text-sm font-medium text-blue-800">Chat History Preview</Label>
      <p className="text-xs text-blue-600 mt-1">
        The complete chat history and customer information will be automatically included in the ticket description.
      </p>
    </div>
  );
};

export default ChatHistoryPreview;
