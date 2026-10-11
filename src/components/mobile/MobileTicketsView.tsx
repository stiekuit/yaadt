import { useState, useEffect } from 'react';
import { Plus, Search, Filter, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useConfig } from '@/contexts/ConfigContext';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import EmptyTicketsState from '@/components/tickets/EmptyTicketsState';
import { MobileCreateTicketSheet } from './MobileCreateTicketSheet';
import { MobileTicketDetailsSheet } from './MobileTicketDetailsSheet';
import { MobileFilterSheet } from './MobileFilterSheet';
import { Skeleton } from '@/components/ui/skeleton';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { cn } from '@/lib/utils';

export const MobileTicketsView = () => {
  const { tickets, ticketsLoading, activeFreshdesk, fetchFreshdeskTickets } = useConfig();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [swipedTicketId, setSwipedTicketId] = useState<number | null>(null);

  useEffect(() => {
    if (activeFreshdesk) {
      fetchFreshdeskTickets();
    }
  }, [activeFreshdesk]);

  const handleRefresh = async () => {
    await fetchFreshdeskTickets();
  };

  // Pull to refresh
  const pullToRefresh = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
  });

  const filteredTickets = tickets.filter(ticket => 
    ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.id?.toString().includes(searchQuery)
  );

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 4: return 'bg-destructive text-destructive-foreground';
      case 3: return 'bg-orange-100 text-orange-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 1: return 'bg-green-100 text-green-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 2: return 'bg-destructive/10 text-destructive';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-green-100 text-green-800';
      case 5: return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 4: return 'Urgent';
      case 3: return 'High';
      case 2: return 'Medium';
      case 1: return 'Low';
      default: return 'Unknown';
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 2: return 'Open';
      case 3: return 'Pending';
      case 4: return 'Resolved';
      case 5: return 'Closed';
      default: return 'Unknown';
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border pb-safe-top">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Tickets</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={pullToRefresh.isRefreshing}
              aria-label={pullToRefresh.isRefreshing ? "Refreshing tickets" : "Refresh tickets"}
            >
              <RefreshCw className={`h-5 w-5 ${pullToRefresh.isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-11"
                aria-label="Search tickets"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 shrink-0"
              onClick={() => setIsFilterOpen(true)}
              aria-label="Filter tickets"
            >
              <Filter className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

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

      {/* Tickets List */}
      <div 
        className="flex-1 overflow-y-auto p-4 pb-24"
        onTouchStart={pullToRefresh.handleTouchStart}
        onTouchMove={pullToRefresh.handleTouchMove}
        onTouchEnd={pullToRefresh.handleTouchEnd}
      >
        {ticketsLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : !activeFreshdesk ? (
          <EmptyTicketsState 
            activeFreshdesk={activeFreshdesk}
            searchQuery=""
            onClearSearch={() => {}}
          />
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <p className="text-muted-foreground">No tickets found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((ticket) => {
              const TicketSwipeHandlers = () => {
                const swipeHandlers = useSwipeGesture({
                  onSwipeLeft: () => setSwipedTicketId(ticket.id),
                  onSwipeRight: () => setSwipedTicketId(null),
                }, {
                  minSwipeDistance: 80,
                });

                const isSwiped = swipedTicketId === ticket.id;

                return (
                  <div
                    key={ticket.id}
                    className="relative overflow-hidden"
                    {...swipeHandlers}
                  >
                    {/* Delete Action (behind card) */}
                    {isSwiped && (
                      <div className="absolute inset-0 bg-destructive flex items-center justify-end px-6 rounded-xl">
                        <Trash2 className="h-5 w-5 text-destructive-foreground" />
                      </div>
                    )}

                    {/* Ticket Card */}
                    <div
                      onClick={() => !isSwiped && setSelectedTicket(ticket)}
                      className={cn(
                        "bg-card border border-border rounded-xl p-4 transition-all touch-manipulation",
                        isSwiped ? "translate-x-[-80px]" : "translate-x-0",
                        !isSwiped && "active:scale-[0.98]"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">#{ticket.id}</span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                            {getPriorityText(ticket.priority)}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                          {getStatusText(ticket.status)}
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-sm mb-2 line-clamp-1">
                        {ticket.subject}
                      </h3>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {ticket.description_text}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>ID: {ticket.requester_id}</span>
                        <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              };

              return <TicketSwipeHandlers key={ticket.id} />;
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      {activeFreshdesk && (
        <Button
          size="icon"
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-20"
          onClick={() => setIsCreateOpen(true)}
          aria-label="Create new ticket"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Modals */}
      <MobileCreateTicketSheet
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onTicketCreated={fetchFreshdeskTickets}
      />

      {selectedTicket && (
        <MobileTicketDetailsSheet
          ticket={selectedTicket}
          open={!!selectedTicket}
          onOpenChange={(open) => !open && setSelectedTicket(null)}
          onTicketUpdated={fetchFreshdeskTickets}
        />
      )}

      <MobileFilterSheet
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
      />
    </div>
  );
};
