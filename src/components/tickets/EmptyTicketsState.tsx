
import React from 'react';
import { AlertCircle, CheckCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyTicketsStateProps {
  activeFreshdesk: any;
  searchQuery: string;
  onClearSearch: () => void;
}

const EmptyTicketsState = ({ activeFreshdesk, searchQuery, onClearSearch }: EmptyTicketsStateProps) => {
  if (!activeFreshdesk) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Freshdesk Configuration</h3>
        <p className="text-gray-500 mb-4">
          Please configure your Freshdesk connection in the Settings panel to manage tickets.
        </p>
        <p className="text-sm text-gray-400 mb-4">
          You can still view the ticket creation template below to see what information will be collected.
        </p>
      </div>
    );
  }

  if (searchQuery) {
    return (
      <div className="text-center py-8">
        <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Tickets Found</h3>
        <p className="text-gray-500 mb-4">
          No tickets match your search for "{searchQuery}". Try adjusting your search terms.
        </p>
        <Button onClick={onClearSearch} variant="outline">
          Clear Search
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Tickets Found</h3>
      <p className="text-gray-500 mb-4">
        No support tickets found. Create a new ticket to get started.
      </p>
    </div>
  );
};

export default EmptyTicketsState;
