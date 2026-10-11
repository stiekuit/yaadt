
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface CustomerInfo {
  customerName?: string;
  customerNumber?: string;
  customerEmail?: string;
  deviceSerials?: string[];
}

interface CustomerInfoDisplayProps {
  customerInfo?: CustomerInfo;
  ticketReference?: string;
  existingTicketId?: string | null;
  onViewTicket?: (ticketId: string) => void;
}

const CustomerInfoDisplay = ({ 
  customerInfo, 
  ticketReference, 
  existingTicketId,
  onViewTicket 
}: CustomerInfoDisplayProps) => {
  const displayTicketId = ticketReference || existingTicketId;

  const handleViewTicket = () => {
    if (displayTicketId && onViewTicket) {
      onViewTicket(displayTicketId);
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg border">
      <h4 className="text-sm font-semibold text-gray-800 mb-3">Customer Information</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-medium text-gray-600">Customer Name</Label>
          <p className="text-sm text-gray-900 mt-1">{customerInfo?.customerName || 'Not provided'}</p>
        </div>
        <div>
          <Label className="text-xs font-medium text-gray-600">Customer Email</Label>
          <p className="text-sm text-gray-900 mt-1">{customerInfo?.customerEmail || 'Not provided'}</p>
        </div>
        <div>
          <Label className="text-xs font-medium text-gray-600">Customer Number</Label>
          <p className="text-sm text-gray-900 mt-1">{customerInfo?.customerNumber || 'Not provided'}</p>
        </div>
        <div>
          <Label className="text-xs font-medium text-gray-600">Device Serials</Label>
          <p className="text-sm text-gray-900 mt-1">
            {customerInfo?.deviceSerials && customerInfo.deviceSerials.length > 0 
              ? customerInfo.deviceSerials.filter(serial => serial.trim()).join(', ')
              : 'Not provided'
            }
          </p>
        </div>
        {displayTicketId && (
          <div className="col-span-2">
            <Label className="text-xs font-medium text-gray-600">
              {ticketReference ? 'Ticket Reference' : 'Associated Ticket'}
            </Label>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm font-semibold text-green-700 bg-green-50 px-2 py-1 rounded border">
                #{displayTicketId}
              </p>
              {onViewTicket && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleViewTicket}
                  className="h-7 px-2 text-xs"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View Ticket
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerInfoDisplay;
