
import React from 'react';
import EditableTicketModal from './EditableTicketModal';

interface ViewTicketModalProps {
  ticket: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
  // Add compatibility props for existing usage
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onTicketUpdated?: () => void;
}

const ViewTicketModal = ({ 
  ticket, 
  isOpen, 
  onClose, 
  onUpdate,
  open,
  onOpenChange,
  onTicketUpdated
}: ViewTicketModalProps) => {
  // Handle both prop patterns for compatibility
  const modalOpen = open !== undefined ? open : isOpen;
  const handleClose = onOpenChange ? () => onOpenChange(false) : onClose;
  const handleUpdate = onTicketUpdated || onUpdate;

  return (
    <EditableTicketModal
      ticket={ticket}
      isOpen={modalOpen}
      onClose={handleClose}
      onUpdate={handleUpdate}
    />
  );
};

export default ViewTicketModal;
