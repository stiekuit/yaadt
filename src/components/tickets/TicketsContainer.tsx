import React, { useState } from 'react';
import TicketsHeader from './TicketsHeader';
import TicketsList from './TicketsList';
import ViewTicketModal from '@/components/ViewTicketModal';

interface TicketsContainerProps {
  activeFreshdesk: any;
  tickets: any[];
  ticketsLoading: boolean;
  onRefresh: () => void;
  onTicketCreated: () => void;
}

const TicketsContainer = ({ 
  activeFreshdesk, 
  tickets, 
  ticketsLoading, 
  onRefresh, 
  onTicketCreated 
}: TicketsContainerProps) => {
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchedTickets, setFetchedTickets] = useState<any[]>([]);

  // Combine regular tickets with specifically fetched tickets
  const allTickets = [...tickets, ...fetchedTickets];

  // Filter tickets based on search query
  const filteredTickets = allTickets.filter(ticket => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const isNumericSearch = /^\d+$/.test(query);
    
    // If it's a numeric search, match ticket ID exactly
    if (isNumericSearch) {
      return ticket.id.toString() === query;
    }
    
    // Otherwise, search in subject, description, etc.
    return (
      ticket.subject?.toLowerCase().includes(query) ||
      ticket.description_text?.toLowerCase().includes(query) ||
      ticket.id.toString().includes(query) ||
      ticket.requester_id.toString().includes(query)
    );
  });

  const handleTicketClick = (ticket: any) => {
    setSelectedTicket(ticket);
    setViewModalOpen(true);
  };

  const handleTicketUpdated = () => {
    onRefresh();
    setViewModalOpen(false);
  };

  const handleModalClose = () => {
    setViewModalOpen(false);
  };

  const handleTicketFetched = (ticket: any) => {
    // Add the fetched ticket to our list if it's not already there
    const existingTicket = allTickets.find(t => t.id === ticket.id);
    if (!existingTicket) {
      setFetchedTickets(prev => [...prev, ticket]);
    }
    
    // Clear search and show the fetched ticket
    setSearchQuery('');
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <>
      <TicketsHeader
        activeFreshdesk={activeFreshdesk}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        ticketsLoading={ticketsLoading}
        onRefresh={onRefresh}
        onTicketCreated={onTicketCreated}
        onTicketFetched={handleTicketFetched}
      />

      <div className="p-6">
        <TicketsList
          activeFreshdesk={activeFreshdesk}
          ticketsLoading={ticketsLoading}
          filteredTickets={filteredTickets}
          tickets={allTickets}
          searchQuery={searchQuery}
          onTicketClick={handleTicketClick}
          onTicketUpdated={onRefresh}
          onClearSearch={clearSearch}
        />
      </div>

      {/* View Ticket Modal */}
      {selectedTicket && (
        <ViewTicketModal
          ticket={selectedTicket}
          isOpen={viewModalOpen}
          onClose={handleModalClose}
          open={viewModalOpen}
          onOpenChange={setViewModalOpen}
          onTicketUpdated={handleTicketUpdated}
        />
      )}
    </>
  );
};

export default TicketsContainer;
