
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AgentSelector from './AgentSelector';
import GroupSelector from './GroupSelector';

interface EditTicketFormFieldsProps {
  formData: {
    subject: string;
    description: string;
    responder_id: string;
    group_id: string;
  };
  onFormDataChange: (data: any) => void;
}

const EditTicketFormFields = ({ formData, onFormDataChange }: EditTicketFormFieldsProps) => {
  const handleAgentChange = (agentId: string) => {
    const value = agentId === 'unassigned' ? '' : agentId;
    onFormDataChange({ ...formData, responder_id: value });
  };

  const handleGroupChange = (groupId: string) => {
    const value = groupId === 'no_group' ? '' : groupId;
    onFormDataChange({ ...formData, group_id: value });
  };

  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="subject" className="text-right">
          Subject
        </Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => onFormDataChange({ ...formData, subject: e.target.value })}
          className="col-span-3"
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="description" className="text-right pt-2">
          Description
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
          className="col-span-3 min-h-[100px]"
          required
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Assigned Agent</Label>
        <div className="col-span-3">
          <AgentSelector
            value={formData.responder_id || 'unassigned'}
            onChange={handleAgentChange}
            label=""
          />
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Group Assignment</Label>
        <div className="col-span-3">
          <GroupSelector
            value={formData.group_id || 'no_group'}
            onChange={handleGroupChange}
            label=""
          />
        </div>
      </div>
    </>
  );
};

export default EditTicketFormFields;
