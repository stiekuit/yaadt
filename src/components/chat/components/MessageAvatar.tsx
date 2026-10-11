
import React from 'react';
import { User, Bot } from 'lucide-react';

interface MessageAvatarProps {
  isUser: boolean;
}

const MessageAvatar = ({ isUser }: MessageAvatarProps) => {
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
      isUser
        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
        : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 border-2 border-white'
    }`}>
      {isUser ? (
        <User className="w-5 h-5" />
      ) : (
        <Bot className="w-5 h-5" />
      )}
    </div>
  );
};

export default MessageAvatar;
