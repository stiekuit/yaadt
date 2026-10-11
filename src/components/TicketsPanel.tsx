
import React, { useEffect } from 'react';
import { useConfig } from '@/contexts/ConfigContext';
import TicketsContainer from './tickets/TicketsContainer';

const TicketsPanel = () => {
  const { 
    tickets, 
    ticketsLoading, 
    activeFreshdesk, 
    fetchFreshdeskTickets 
  } = useConfig();

  useEffect(() => {
    if (activeFreshdesk) {
      fetchFreshdeskTickets();
    }
  }, [activeFreshdesk]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 h-full">
      <TicketsContainer
        activeFreshdesk={activeFreshdesk}
        tickets={tickets}
        ticketsLoading={ticketsLoading}
        onRefresh={fetchFreshdeskTickets}
        onTicketCreated={fetchFreshdeskTickets}
      />
    </div>
  );
};

export default TicketsPanel;
