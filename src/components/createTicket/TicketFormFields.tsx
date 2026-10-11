
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

interface TicketFormFieldsProps {
  formData: {
    subject: string;
    email: string;
    description: string;
    priority: string;
    status: string;
    deviceSerials: string[];
  };
  onFormDataChange: (data: any) => void;
}

const TicketFormFields = ({ formData, onFormDataChange }: TicketFormFieldsProps) => {
  const handleInputChange = (field: string, value: string) => {
    onFormDataChange({
      ...formData,
      [field]: value,
    });
  };

  const handleDeviceSerialChange = (index: number, value: string) => {
    const newSerials = [...formData.deviceSerials];
    newSerials[index] = value;
    onFormDataChange({
      ...formData,
      deviceSerials: newSerials,
    });
  };

  const addDeviceSerial = () => {
    onFormDataChange({
      ...formData,
      deviceSerials: [...formData.deviceSerials, ''],
    });
  };

  const removeDeviceSerial = (index: number) => {
    const newSerials = formData.deviceSerials.filter((_, i) => i !== index);
    onFormDataChange({
      ...formData,
      deviceSerials: newSerials,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="subject">Subject *</Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => handleInputChange('subject', e.target.value)}
          placeholder="Brief description of the issue"
          required
        />
      </div>

      <div>
        <Label htmlFor="email">Customer Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="customer@example.com"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Additional details about the ticket..."
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Priority</Label>
          <Select 
            value={formData.priority} 
            onValueChange={(value) => handleInputChange('priority', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Low</SelectItem>
              <SelectItem value="2">Medium</SelectItem>
              <SelectItem value="3">High</SelectItem>
              <SelectItem value="4">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => handleInputChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">Open</SelectItem>
              <SelectItem value="3">Pending</SelectItem>
              <SelectItem value="4">Resolved</SelectItem>
              <SelectItem value="5">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Device Serials</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addDeviceSerial}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Serial
          </Button>
        </div>
        <div className="space-y-2">
          {formData.deviceSerials.map((serial, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={serial}
                onChange={(e) => handleDeviceSerialChange(index, e.target.value)}
                placeholder="Enter device serial number"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeDeviceSerial(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {formData.deviceSerials.length === 0 && (
            <p className="text-sm text-gray-500">No device serials added</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketFormFields;
