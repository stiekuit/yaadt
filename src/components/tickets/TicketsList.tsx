
import React from 'react';
import { RefreshCw } from 'lucide-react';
import TicketCard from './TicketCard';
import EmptyTicketsState from './EmptyTicketsState';

interface TicketsListProps {
  activeFreshdesk: any;
  ticketsLoading: boolean;
  filteredTickets: any[];
  tickets: any[];
  searchQuery: string;
  onTicketClick: (ticket: any) => void;
  onTicketUpdated: () => void;
  onClearSearch: () => void;
}

const TicketsList = ({
  activeFreshdesk,
  ticketsLoading,
  filteredTickets,
  tickets,
  searchQuery,
  onTicketClick,
  onTicketUpdated,
  onClearSearch
}: TicketsListProps) => {
  if (!activeFreshdesk || ticketsLoading) {
    if (ticketsLoading) {
      return (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-500">Loading tickets...</p>
        </div>
      );
    }
    return <EmptyTicketsState activeFreshdesk={activeFreshdesk} searchQuery={searchQuery} onClearSearch={onClearSearch} />;
  }

  if (filteredTickets.length === 0) {
    return <EmptyTicketsState activeFreshdesk={activeFreshdesk} searchQuery={searchQuery} onClearSearch={onClearSearch} />;
  }

  return (
    <div className="space-y-4">
      {searchQuery && (
        <div className="text-sm text-gray-600 mb-4">
          Showing {filteredTickets.length} of {tickets.length} tickets
        </div>
      )}
      {filteredTickets.map((ticket) => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          onTicketClick={onTicketClick}
          onTicketUpdated={onTicketUpdated}
        />
      ))}
    </div>
  );
};

export default TicketsList;
