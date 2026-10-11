import { MessageSquare, Plus, Search, Trash2, RefreshCw } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useConfig } from '@/contexts/ConfigContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import BulkDeleteChatsButton from '@/components/BulkDeleteChatsButton';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

interface ChatHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChatHistoryDrawer = ({ open, onOpenChange }: ChatHistoryDrawerProps) => {
  const {
    chatSessions,
    currentChatSession,
    createChatSession,
    setCurrentChatSession,
    loadChatMessages,
    deleteChatSession,
    loadChatSessions,
  } = useConfig();

  const [searchQuery, setSearchQuery] = useState('');

  const handleNewChat = async () => {
    const newSession = await createChatSession();
    if (newSession) {
      setCurrentChatSession(newSession);
      await loadChatSessions();
    }
    onOpenChange(false);
  };

  const handleSelectChat = async (session: typeof chatSessions[0]) => {
    setCurrentChatSession(session);
    try {
      await loadChatMessages(session.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleDeleteChat = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      await deleteChatSession(sessionId);
    }
  };

  const filteredSessions = chatSessions.filter((session) =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const emptyChatsCount = chatSessions.filter((s) => s.title === 'New Chat').length;

  // Pull to refresh
  const pullToRefresh = usePullToRefresh({
    onRefresh: loadChatSessions,
    threshold: 80,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="left" 
        className="w-[88vw] max-w-sm p-0 flex flex-col h-full"
      >
        <SheetHeader className="p-4 pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Chat History
            </SheetTitle>
            <Button
              onClick={handleNewChat}
              size="sm"
              className="min-touch-target"
            >
              <Plus className="w-4 h-4 mr-1" />
              New
            </Button>
          </div>
        </SheetHeader>

        {/* Search */}
        <div className="p-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Bulk Delete */}
        {emptyChatsCount > 0 && (
          <div className="px-4 pb-2">
            <BulkDeleteChatsButton
              emptyChatsCount={emptyChatsCount}
              onDeleteComplete={loadChatSessions}
            />
          </div>
        )}

        {/* Chat List */}
        <div className="flex-1 overflow-hidden relative">
          {/* Pull to Refresh Indicator */}
          {pullToRefresh.pullDistance > 0 && (
            <div 
              className="flex items-center justify-center py-2 bg-primary/10"
              style={{
                height: `${pullToRefresh.pullDistance}px`,
                transition: pullToRefresh.isRefreshing ? 'height 0.2s' : 'none'
              }}
            >
              <RefreshCw 
                className={cn(
                  "h-5 w-5 text-primary",
                  pullToRefresh.isRefreshing && "animate-spin",
                  pullToRefresh.isReady && !pullToRefresh.isRefreshing && "scale-110"
                )}
              />
            </div>
          )}

          <ScrollArea 
            className="h-full"
            onTouchStart={pullToRefresh.handleTouchStart}
            onTouchMove={pullToRefresh.handleTouchMove}
            onTouchEnd={pullToRefresh.handleTouchEnd}
          >
            <div className="p-2 space-y-1">
            {filteredSessions.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-sm font-medium text-muted-foreground">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {searchQuery ? 'Try a different search' : 'Start a new chat to begin'}
                </p>
              </div>
            ) : (
              filteredSessions.map((session) => {
                const isActive = currentChatSession?.id === session.id;
                return (
                  <div
                    key={session.id}
                    onClick={() => handleSelectChat(session)}
                    className={cn(
                      'group relative rounded-lg p-3 transition-all touch-feedback cursor-pointer',
                      isActive
                        ? 'bg-primary/10 border border-primary/30'
                        : 'hover:bg-muted border border-transparent'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                          isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        )}
                      >
                        <MessageSquare className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4
                          className={cn(
                            'text-sm font-medium truncate',
                            isActive ? 'text-primary' : 'text-foreground'
                          )}
                        >
                          {session.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(session.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      {/* Delete Button */}
                      <Button
                        onClick={(e) => handleDeleteChat(session.id, e)}
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};
