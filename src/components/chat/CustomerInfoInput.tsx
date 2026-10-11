
import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, ChevronDown, ChevronUp, Smartphone, Plus, X, Type, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCustomerFields } from '@/contexts/CustomerFieldContext';

interface CustomerInfo {
  customerName: string;
  customerEmail: string;
  customerNumber: string;
  deviceSerials: string[];
}

interface CustomerInfoInputProps {
  customerInfo: CustomerInfo;
  onCustomerInfoChange: (info: CustomerInfo) => void;
  onSave: () => void;
  isCollapsed?: boolean;
}

const CustomerInfoInput = ({ 
  customerInfo, 
  onCustomerInfoChange, 
  onSave,
  isCollapsed = false 
}: CustomerInfoInputProps) => {
  const [collapsed, setCollapsed] = useState(isCollapsed);
  const [hasChanges, setHasChanges] = useState(false);
  const { fields, loading } = useCustomerFields();

  const getFieldIcon = (iconName?: string) => {
    switch (iconName) {
      case 'User': return User;
      case 'Mail': return Mail;
      case 'Phone': return Phone;
      case 'Smartphone': return Smartphone;
      default: return Type;
    }
  };

  const handleInputChange = (field: keyof CustomerInfo, value: string | string[]) => {
    const newInfo = { ...customerInfo, [field]: value };
    onCustomerInfoChange(newInfo);
    setHasChanges(true);
  };

  const addDeviceSerial = () => {
    const newDeviceSerials = [...customerInfo.deviceSerials, ''];
    handleInputChange('deviceSerials', newDeviceSerials);
  };

  const removeDeviceSerial = (index: number) => {
    const newDeviceSerials = customerInfo.deviceSerials.filter((_, i) => i !== index);
    handleInputChange('deviceSerials', newDeviceSerials);
  };

  const updateDeviceSerial = (index: number, value: string) => {
    const newDeviceSerials = [...customerInfo.deviceSerials];
    newDeviceSerials[index] = value;
    handleInputChange('deviceSerials', newDeviceSerials);
  };

  const handleSave = () => {
    onSave();
    setHasChanges(false);
  };

  const hasAnyInfo = customerInfo.customerName || 
                     customerInfo.customerEmail || 
                     customerInfo.customerNumber ||
                     customerInfo.deviceSerials.some(serial => serial.trim());

  const visibleFields = fields.filter(field => field.is_visible).sort((a, b) => a.display_order - b.display_order);

  const getFieldValue = (fieldName: string) => {
    switch (fieldName) {
      case 'customer_name': return customerInfo.customerName;
      case 'customer_email': return customerInfo.customerEmail;
      case 'customer_number': return customerInfo.customerNumber;
      case 'device_serials': return customerInfo.deviceSerials;
      default: return '';
    }
  };

  const setFieldValue = (fieldName: string, value: string | string[]) => {
    switch (fieldName) {
      case 'customer_name': return handleInputChange('customerName', value as string);
      case 'customer_email': return handleInputChange('customerEmail', value as string);
      case 'customer_number': return handleInputChange('customerNumber', value as string);
      case 'device_serials': return handleInputChange('deviceSerials', value as string[]);
    }
  };

  const renderField = (field: any) => {
    const IconComponent = getFieldIcon(field.icon);
    const value = getFieldValue(field.field_name);

    if (field.field_name === 'device_serials') {
      return (
        <div key={field.id}>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs font-medium text-gray-600">
              {field.display_name}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addDeviceSerial}
              className="h-7 px-2"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Device
            </Button>
          </div>
          
          {customerInfo.deviceSerials.length === 0 ? (
            <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md border border-dashed">
              {field.placeholder_text || 'No device serials added. Click "Add Device" to add device serial numbers.'}
            </div>
          ) : (
            <div className="space-y-2">
              {customerInfo.deviceSerials.map((serial, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <IconComponent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder={`Device serial #${index + 1}`}
                      value={serial}
                      onChange={(e) => updateDeviceSerial(index, e.target.value)}
                      className="pl-10"
                      required={field.is_required && index === 0}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeDeviceSerial(index)}
                    className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={field.id}>
        <Label htmlFor={field.field_name} className="text-xs font-medium text-gray-600">
          {field.display_name}
          {field.is_required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <div className="relative">
          <IconComponent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id={field.field_name}
            type={field.field_type}
            placeholder={field.placeholder_text || `Enter ${field.display_name.toLowerCase()}`}
            value={value as string}
            onChange={(e) => setFieldValue(field.field_name, e.target.value)}
            className="pl-10"
            required={field.is_required}
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader 
        className="pb-2 cursor-pointer" 
        onClick={() => setCollapsed(!collapsed)}
      >
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-blue-600" />
            <span>Customer Information</span>
            {hasAnyInfo && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Provided
              </span>
            )}
          </div>
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </CardTitle>
      </CardHeader>
      
      {!collapsed && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleFields.filter(field => field.field_name !== 'device_serials').map(field => renderField(field))}
          </div>
          
          {/* Render device serials separately if visible */}
          {visibleFields.find(field => field.field_name === 'device_serials') && 
            renderField(visibleFields.find(field => field.field_name === 'device_serials')!)
          }
          
          {hasChanges && (
            <Button 
              onClick={handleSave}
              size="sm"
              className="w-full"
            >
              Save Customer Information
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default CustomerInfoInput;
