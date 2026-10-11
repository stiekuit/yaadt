
import React from 'react';
import { Clock, AlertCircle, CheckCircle, User } from 'lucide-react';
import EditTicketModal from '../EditTicketModal';

interface TicketCardProps {
  ticket: any;
  onTicketClick: (ticket: any) => void;
  onTicketUpdated: () => void;
}

const TicketCard = ({ ticket, onTicketClick, onTicketUpdated }: TicketCardProps) => {
  const getStatusIcon = (status: number) => {
    switch (status) {
      case 2: // Open
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 3: // Pending
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 4: // Resolved
      case 5: // Closed
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 4: // Urgent
        return 'bg-red-100 text-red-800';
      case 3: // High
        return 'bg-orange-100 text-orange-800';
      case 2: // Medium
        return 'bg-yellow-100 text-yellow-800';
      case 1: // Low
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const getStatusColor = (status: number) => {
    switch (status) {
      case 2: return 'bg-red-100 text-red-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-green-100 text-green-800';
      case 5: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={() => onTicketClick(ticket)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {getStatusIcon(ticket.status)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-gray-900">
                #{ticket.id}
              </h3>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                  ticket.priority
                )}`}
              >
                {getPriorityText(ticket.priority)}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900 mt-1 truncate">
              {ticket.subject}
            </p>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {ticket.description_text?.substring(0, 150)}
              {ticket.description_text?.length > 150 ? '...' : ''}
            </p>
            <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>Requester ID: {ticket.requester_id}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
              ticket.status
            )}`}
          >
            {getStatusText(ticket.status)}
          </span>
          <EditTicketModal ticket={ticket} onTicketUpdated={onTicketUpdated} />
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
