
import React, { useState, useEffect } from 'react';
import { X, Save, Edit, Undo2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useConfig } from '@/contexts/ConfigContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useFreshdesk } from '@/contexts/FreshdeskContext';
import EditTicketFormFields from './editTicket/EditTicketFormFields';
import EditTicketStatusFields from './editTicket/EditTicketStatusFields';
import TicketConversationView from './TicketConversationView';
import AddNoteSection from './editTicket/AddNoteSection';

interface EditableTicketModalProps {
  ticket: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const EditableTicketModal = ({ ticket, isOpen, onClose, onUpdate }: EditableTicketModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editedTicket, setEditedTicket] = useState(ticket);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshConversations, setRefreshConversations] = useState(0);
  
  const { updateFreshdeskTicket } = useConfig();
  const { activeFreshdesk } = useFreshdesk();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();

  const canEdit = hasPermission('ticket_edit');
  const canChangeStatus = hasPermission('ticket_status_change');
  const canAssign = hasPermission('ticket_assign');

  useEffect(() => {
    setEditedTicket(ticket);
    setHasUnsavedChanges(false);
  }, [ticket]);

  const handleFieldChange = (field: string, value: any) => {
    setEditedTicket(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleFormDataChange = (formData: any) => {
    setEditedTicket(formData);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!canEdit) return;

    setIsSubmitting(true);
    try {
      const success = await updateFreshdeskTicket(ticket.id, editedTicket);
      if (success) {
        toast({
          title: "Success",
          description: "Ticket updated successfully",
        });
        setIsEditing(false);
        setHasUnsavedChanges(false);
        onUpdate?.();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ticket",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        setEditedTicket(ticket);
        setIsEditing(false);
        setHasUnsavedChanges(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleNoteAdded = () => {
    setRefreshConversations(prev => prev + 1);
  };

  const openInFreshdesk = () => {
    if (activeFreshdesk && ticket?.id) {
      const freshdeskUrl = `https://${activeFreshdesk.domain}.freshdesk.com/a/tickets/${ticket.id}`;
      window.open(freshdeskUrl, '_blank');
    }
  };

  const statusOptions = [
    { value: '2', label: 'Open', color: 'bg-blue-500' },
    { value: '3', label: 'Pending', color: 'bg-yellow-500' },
    { value: '4', label: 'Resolved', color: 'bg-green-500' },
    { value: '5', label: 'Closed', color: 'bg-gray-500' }
  ];

  const priorityOptions = [
    { value: '1', label: 'Low', color: 'bg-gray-500' },
    { value: '2', label: 'Medium', color: 'bg-blue-500' },
    { value: '3', label: 'High', color: 'bg-orange-500' },
    { value: '4', label: 'Urgent', color: 'bg-red-500' }
  ];

  const getStatusLabel = (status: number) => statusOptions.find(s => s.value === status.toString())?.label || 'Unknown';
  const getPriorityLabel = (priority: number) => priorityOptions.find(p => p.value === priority.toString())?.label || 'Unknown';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Ticket #{ticket?.id}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Edit ticket details' : 'View ticket information'}
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              {activeFreshdesk && (
                <Button onClick={openInFreshdesk} variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Freshdesk
                </Button>
              )}
              {canEdit && (
                <>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        <Undo2 className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSave} 
                        size="sm" 
                        disabled={isSubmitting || !hasUnsavedChanges}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="conversation">Conversation</TabsTrigger>
            <TabsTrigger value="notes">Add Note</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Read-only fields */}
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ticket ID</label>
                    <div className="mt-1 p-2 bg-gray-50 rounded border">
                      #{ticket?.id}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Requester ID</label>
                    <div className="mt-1 p-2 bg-gray-50 rounded border">
                      {ticket?.requester_id}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Created Date</label>
                    <div className="mt-1 p-2 bg-gray-50 rounded border">
                      {new Date(ticket?.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Updated Date</label>
                    <div className="mt-1 p-2 bg-gray-50 rounded border">
                      {new Date(ticket?.updated_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                {isEditing && canEdit ? (
                  <EditTicketFormFields
                    formData={editedTicket}
                    onFormDataChange={handleFormDataChange}
                  />
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Subject</label>
                      <div className="mt-1 p-2 bg-gray-50 rounded border">
                        {ticket?.subject}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Description</label>
                      <div 
                        className="mt-1 p-3 bg-gray-50 rounded border min-h-[120px] whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ 
                          __html: ticket?.description || ticket?.description_text || 'No description provided' 
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status and Priority */}
            <Card>
              <CardHeader>
                <CardTitle>Status & Priority</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing && (canChangeStatus || canEdit) ? (
                  <EditTicketStatusFields
                    formData={editedTicket}
                    onFormDataChange={handleFormDataChange}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <div className="mt-1">
                        <Badge className={statusOptions.find(s => s.value === ticket?.status?.toString())?.color}>
                          {getStatusLabel(ticket?.status)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Priority</label>
                      <div className="mt-1">
                        <Badge className={priorityOptions.find(p => p.value === ticket?.priority?.toString())?.color}>
                          {getPriorityLabel(ticket?.priority)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assignment */}
            <Card>
              <CardHeader>
                <CardTitle>Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Assigned Agent</label>
                    <div className="mt-1 p-2 bg-gray-50 rounded border">
                      {ticket?.responder_id || 'Unassigned'}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Group</label>
                    <div className="mt-1 p-2 bg-gray-50 rounded border">
                      {ticket?.group_id || 'No group assigned'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversation">
            {ticket?.id && <TicketConversationView ticketId={ticket.id} key={refreshConversations} />}
          </TabsContent>

          <TabsContent value="notes">
            {ticket?.id && <AddNoteSection ticketId={ticket.id} onNoteAdded={handleNoteAdded} />}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EditableTicketModal;
