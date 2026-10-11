
import React from 'react';
import { Plus, MessageSquare, Trash2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import BulkDeleteChatsButton from '@/components/BulkDeleteChatsButton';

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}

interface ChatSidebarProps {
  chatSessions: ChatSession[];
  currentChatSession: ChatSession | null;
  activeWebhook: WebhookConfig | null;
  onNewChat: () => void;
  onSelectChat: (session: ChatSession) => void;
  onDeleteChat: (sessionId: string) => void;
  onClearEmptyChats: () => void;
}

const ChatSidebar = ({
  chatSessions,
  currentChatSession,
  activeWebhook,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onClearEmptyChats
}: ChatSidebarProps) => {
  const emptyChatsCount = chatSessions.filter(s => s.title === 'New Chat').length;

  return (
    <div className="h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-white">Chat History</h3>
          </div>
          <Button 
            onClick={onNewChat} 
            size="sm" 
            className="bg-cyan-600 hover:bg-cyan-700 text-white border-0"
          >
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
        
        {emptyChatsCount > 0 && (
          <div className="mb-3">
            <BulkDeleteChatsButton 
              emptyChatsCount={emptyChatsCount}
              onDeleteComplete={onClearEmptyChats}
            />
          </div>
        )}

        {/* Connection Status */}
        <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-3 py-2">
          {activeWebhook ? (
            <>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <Zap className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400 font-medium">Connected</span>
              <Badge variant="secondary" className="text-xs bg-green-400/20 text-green-400 border-green-400/30">
                {activeWebhook.name}
              </Badge>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-xs text-red-400 font-medium">No webhook configured</span>
            </>
          )}
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {chatSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs text-gray-500">Start a new chat to begin</p>
            </div>
          ) : (
            chatSessions.map((session) => (
              <div
                key={session.id}
                className={`group relative rounded-lg transition-all duration-200 ${
                  currentChatSession?.id === session.id
                    ? 'bg-cyan-600/20 border border-cyan-500/30 shadow-lg'
                    : 'hover:bg-gray-700/50 border border-transparent'
                }`}
              >
                <div 
                  className="flex items-start space-x-3 p-3 cursor-pointer"
                  onClick={() => onSelectChat(session)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    currentChatSession?.id === session.id
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium truncate ${
                      currentChatSession?.id === session.id
                        ? 'text-white'
                        : 'text-gray-200'
                    }`}>
                      {session.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(session.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                {/* Delete Button */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(session.id);
                  }}
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto w-auto text-red-400 hover:text-red-300 hover:bg-red-500/20"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatSidebar;
