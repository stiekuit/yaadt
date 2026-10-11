
import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface EmptyChatStateProps {
  hasSession: boolean;
}

const EmptyChatState = ({ hasSession }: EmptyChatStateProps) => {
  if (!hasSession) {
    return (
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to Support Chat</h3>
          <p className="text-gray-600 mb-4">Select a conversation from the sidebar or start a new chat to begin.</p>
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">💡 Tip: Use the "New" button to start a fresh conversation</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Bot className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Help!</h3>
        <p className="text-gray-600 mb-4">Start typing your message below to begin the conversation.</p>
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">🚀 Our AI assistant is ready to assist you with any questions</p>
        </div>
      </div>
    </div>
  );
};

export default EmptyChatState;
