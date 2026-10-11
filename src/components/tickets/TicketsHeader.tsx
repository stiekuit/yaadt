
import React, { useState } from 'react';
import { Search, RefreshCw, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import CreateTicketModal from '../CreateTicketModal';

interface TicketsHeaderProps {
  activeFreshdesk: any;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  ticketsLoading: boolean;
  onRefresh: () => void;
  onTicketCreated: () => void;
  onTicketFetched?: (ticket: any) => void;
}

const TicketsHeader = ({
  activeFreshdesk,
  searchQuery,
  setSearchQuery,
  ticketsLoading,
  onRefresh,
  onTicketCreated,
  onTicketFetched
}: TicketsHeaderProps) => {
  const [isFetchingTicket, setIsFetchingTicket] = useState(false);
  const { toast } = useToast();

  const clearSearch = () => {
    setSearchQuery('');
  };

  const isNumericTicketId = (query: string) => {
    return /^\d+$/.test(query.trim());
  };

  const fetchSpecificTicket = async (ticketId: string) => {
    if (!activeFreshdesk) {
      toast({
        title: "Error",
        description: "No Freshdesk configuration found",
        variant: "destructive",
      });
      return;
    }

    setIsFetchingTicket(true);

    try {
      // This would typically use a service method to fetch a specific ticket
      // For now, we'll simulate the API call
      const response = await fetch(`/api/freshdesk/tickets/${ticketId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const ticket = await response.json();
        onTicketFetched?.(ticket);
        toast({
          title: "Success",
          description: `Ticket #${ticketId} found and loaded`,
        });
      } else {
        toast({
          title: "Not Found",
          description: `Ticket #${ticketId} not found`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching specific ticket:', error);
      toast({
        title: "Error",
        description: "Failed to fetch ticket",
        variant: "destructive",
      });
    } finally {
      setIsFetchingTicket(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNumericTicketId(searchQuery)) {
      fetchSpecificTicket(searchQuery);
    }
  };

  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Support Tickets</h2>
          <p className="text-sm text-gray-500">
            {activeFreshdesk 
              ? `Connected to ${activeFreshdesk.domain}.freshdesk.com`
              : 'No Freshdesk configuration found'
            }
          </p>
        </div>
        <div className="flex space-x-2">
          {activeFreshdesk && (
            <>
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tickets or enter ticket ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 w-64"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
                {isNumericTicketId(searchQuery) && (
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    disabled={isFetchingTicket}
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                    title="Fetch specific ticket"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                )}
              </form>
              <Button 
                onClick={onRefresh} 
                variant="outline" 
                size="sm"
                disabled={ticketsLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${ticketsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </>
          )}
          <CreateTicketModal onTicketCreated={onTicketCreated} />
        </div>
      </div>
    </div>
  );
};

export default TicketsHeader;
