
import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EditTicketStatusFieldsProps {
  formData: {
    status: string;
    priority: string;
  };
  onFormDataChange: (data: any) => void;
}

const EditTicketStatusFields = ({ formData, onFormDataChange }: EditTicketStatusFieldsProps) => {
  const statusOptions = [
    { value: '2', label: 'Open' },
    { value: '3', label: 'Pending' },
    { value: '4', label: 'Resolved' },
    { value: '5', label: 'Closed' },
  ];

  const priorityOptions = [
    { value: '1', label: 'Low' },
    { value: '2', label: 'Medium' },
    { value: '3', label: 'High' },
    { value: '4', label: 'Urgent' },
  ];

  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="status" className="text-right">
          Status
        </Label>
        <Select
          value={formData.status}
          onValueChange={(value) => onFormDataChange({ ...formData, status: value })}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="priority" className="text-right">
          Priority
        </Label>
        <Select
          value={formData.priority}
          onValueChange={(value) => onFormDataChange({ ...formData, priority: value })}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default EditTicketStatusFields;
