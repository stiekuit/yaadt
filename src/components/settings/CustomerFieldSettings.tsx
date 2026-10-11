import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCustomerFields, CustomerFieldConfig } from '@/contexts/CustomerFieldContext';
import { GripVertical, Settings, User, Mail, Phone, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const iconOptions = [
  { value: 'User', label: 'User', icon: User },
  { value: 'Mail', label: 'Mail', icon: Mail },
  { value: 'Phone', label: 'Phone', icon: Phone },
  { value: 'Smartphone', label: 'Smartphone', icon: Smartphone },
  { value: 'Type', label: 'Type', icon: Settings },
];

const fieldTypeOptions = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Phone' },
  { value: 'array', label: 'Multiple Values' },
];

const CustomerFieldSettings = () => {
  const { fields, loading, updateField } = useCustomerFields();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CustomerFieldConfig>>({});
  const { toast } = useToast();

  const handleEditStart = (field: CustomerFieldConfig) => {
    setEditingField(field.id);
    setEditForm(field);
  };

  const handleEditCancel = () => {
    setEditingField(null);
    setEditForm({});
  };

  const handleEditSave = async () => {
    if (!editingField || !editForm) return;

    try {
      await updateField(editingField, editForm);
      setEditingField(null);
      setEditForm({});
    } catch (error) {
      // Error handling is done in the context
    }
  };

  const handleQuickToggle = async (fieldId: string, field: string, value: boolean) => {
    await updateField(fieldId, { [field]: value });
  };

  const getIcon = (iconName?: string) => {
    const IconComponent = iconOptions.find(opt => opt.value === iconName)?.icon || Settings;
    return <IconComponent className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Customer Information Fields</h3>
        <p className="text-sm text-muted-foreground">
          Configure which customer information fields are displayed and required in the chat interface.
        </p>
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <Card key={field.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  {getIcon(field.icon)}
                  <div>
                    <CardTitle className="text-base">{field.display_name}</CardTitle>
                    <CardDescription className="text-sm">{field.field_name}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`visible-${field.id}`} className="text-sm">Visible</Label>
                    <Switch
                      id={`visible-${field.id}`}
                      checked={field.is_visible}
                      onCheckedChange={(checked) => handleQuickToggle(field.id, 'is_visible', checked)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`required-${field.id}`} className="text-sm">Required</Label>
                    <Switch
                      id={`required-${field.id}`}
                      checked={field.is_required}
                      onCheckedChange={(checked) => handleQuickToggle(field.id, 'is_required', checked)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditStart(field)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </CardHeader>

            {editingField === field.id && (
              <CardContent className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input
                      id="display-name"
                      value={editForm.display_name || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="field-type">Field Type</Label>
                    <Select
                      value={editForm.field_type || ''}
                      onValueChange={(value) => setEditForm(prev => ({ ...prev, field_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field type" />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon</Label>
                    <Select
                      value={editForm.icon || ''}
                      onValueChange={(value) => setEditForm(prev => ({ ...prev, icon: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select icon" />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <option.icon className="h-4 w-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="display-order">Display Order</Label>
                    <Input
                      id="display-order"
                      type="number"
                      value={editForm.display_order || 0}
                      onChange={(e) => setEditForm(prev => ({ ...prev, display_order: parseInt(e.target.value) }))}
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="placeholder">Placeholder Text</Label>
                    <Textarea
                      id="placeholder"
                      value={editForm.placeholder_text || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, placeholder_text: e.target.value }))}
                      placeholder="Enter placeholder text for this field"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button onClick={handleEditSave}>Save Changes</Button>
                  <Button variant="outline" onClick={handleEditCancel}>Cancel</Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CustomerFieldSettings;