
import React from 'react';
import { MessageSquare, Users } from 'lucide-react';
import CreateTicketFromChatModal from '../CreateTicketFromChatModal';
import ImportTicketModal from './ImportTicketModal';

interface CustomerInfo {
  customerName: string;
  customerEmail: string;
  customerNumber: string;
  deviceSerials: string[];
}

interface ChatHeaderProps {
  currentChatSession: any;
  chatMessages: any[];
  currentChatType: 'support' | 'general';
  customerInfo?: CustomerInfo;
}

const ChatHeader = ({ currentChatSession, chatMessages, currentChatType, customerInfo }: ChatHeaderProps) => {
  const handleTicketImported = () => {
    // Refresh the chat messages or handle the import success
    console.log('Ticket imported successfully');
  };

  // Only show ticket actions for support chat type
  const showTicketActions = currentChatType === 'support' && currentChatSession && chatMessages.length > 0;

  return (
    <div className="px-6 py-4 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${currentChatType === 'support' ? 'bg-blue-100' : 'bg-green-100'}`}>
            <MessageSquare className={`w-5 h-5 ${currentChatType === 'support' ? 'text-blue-600' : 'text-green-600'}`} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {currentChatSession?.title || 'New Chat'}
            </h2>
            <p className="text-sm text-gray-500 flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {chatMessages.length} messages
              <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded capitalize">
                {currentChatType}
              </span>
            </p>
          </div>
        </div>
        
        {showTicketActions && (
          <div className="flex space-x-2">
            <ImportTicketModal onTicketImported={handleTicketImported} />
            <CreateTicketFromChatModal
              chatTitle={currentChatSession.title}
              chatMessages={chatMessages}
              customerInfo={customerInfo}
              onTicketCreated={() => {
                console.log('Ticket created from chat');
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
