
import React, { useState, useEffect } from 'react';
import { MessageCircle, User, RefreshCw, AlertTriangle, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useConfig } from '@/contexts/ConfigContext';
import { FreshdeskConversation } from '@/services/freshdeskConversationService';
import { useToast } from '@/hooks/use-toast';

interface TicketConversationViewProps {
  ticketId: number;
}

const TicketConversationView = ({ ticketId }: TicketConversationViewProps) => {
  const [conversations, setConversations] = useState<FreshdeskConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationsError, setConversationsError] = useState<string | null>(null);
  const { fetchTicketConversations } = useConfig();
  const { toast } = useToast();

  const loadConversationData = async () => {
    console.log(`Loading conversation data for ticket ${ticketId}`);
    setLoading(true);
    setConversationsError(null);

    try {
      console.log(`Fetching conversations for ticket ${ticketId}`);
      const conversationsData = await fetchTicketConversations(ticketId);
      console.log(`Successfully loaded ${conversationsData.length} conversations`);
      setConversations(conversationsData);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversationsError('Failed to load conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversationData();
  }, [ticketId]);

  const getConversationIcon = (conversation: FreshdeskConversation) => {
    if (conversation.private) {
      return <EyeOff className="w-4 h-4 text-orange-500" />;
    }
    return conversation.incoming ? 
      <MessageCircle className="w-4 h-4 text-blue-500" /> : 
      <User className="w-4 h-4 text-green-500" />;
  };

  // Sort conversations by date
  const sortedConversations = [...conversations].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mr-2" />
        <span className="text-gray-500">Loading conversation...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Conversation</h3>
        <Button onClick={loadConversationData} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {conversationsError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {conversationsError}. This might be due to insufficient permissions or the ticket not existing.
          </AlertDescription>
        </Alert>
      )}

      <ScrollArea className="h-96">
        <div className="space-y-4">
          {sortedConversations.length === 0 && !conversationsError ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No conversation history found</p>
            </div>
          ) : conversationsError && conversations.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-gray-500">Unable to load conversation data</p>
              <p className="text-sm text-gray-400 mt-2">
                Check your Freshdesk configuration and ticket permissions
              </p>
            </div>
          ) : (
            sortedConversations.map((conversation, index) => (
              <div key={conversation.id} className="relative">
                {index < sortedConversations.length - 1 && (
                  <div className="absolute left-5 top-12 w-px h-full bg-gray-200" />
                )}
                
                <div className="flex space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {getConversationIcon(conversation)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {conversation.incoming ? 'Customer' : 'Agent'}
                          </span>
                          {conversation.private && (
                            <Badge variant="outline" className="text-xs">
                              Private Note
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(conversation.created_at).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-700">
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ 
                            __html: conversation.body || conversation.body_text 
                          }}
                        />
                      </div>
                      
                      {conversation.attachments?.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            {conversation.attachments.length} attachment(s)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TicketConversationView;
