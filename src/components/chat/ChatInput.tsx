
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isDisabled: boolean;
}

const ChatInput = ({ onSendMessage, isLoading, isDisabled }: ChatInputProps) => {
  const [inputMessage, setInputMessage] = useState('');

  const handleSend = () => {
    if (inputMessage.trim() && !isLoading) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-6 py-4 border-t border-gray-200">
      <div className="flex space-x-3">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1"
          disabled={isLoading || isDisabled}
        />
        <Button 
          onClick={handleSend} 
          disabled={!inputMessage.trim() || isLoading || isDisabled}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      {isDisabled && (
        <p className="text-xs text-red-500 mt-2">
          Configure a webhook in Settings to enable chat functionality.
        </p>
      )}
    </div>
  );
};

export default ChatInput;
