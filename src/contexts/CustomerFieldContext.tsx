import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CustomerFieldConfig {
  id: string;
  field_name: string;
  display_name: string;
  field_type: string;
  is_required: boolean;
  is_visible: boolean;
  placeholder_text?: string;
  display_order: number;
  icon?: string;
  created_at: string;
  updated_at: string;
}

interface CustomerFieldContextType {
  fields: CustomerFieldConfig[];
  loading: boolean;
  updateField: (id: string, updates: Partial<CustomerFieldConfig>) => Promise<void>;
  reorderFields: (reorderedFields: CustomerFieldConfig[]) => Promise<void>;
  refreshFields: () => Promise<void>;
}

const CustomerFieldContext = createContext<CustomerFieldContextType | undefined>(undefined);

interface CustomerFieldProviderProps {
  children: ReactNode;
}

export const CustomerFieldProvider = ({ children }: CustomerFieldProviderProps) => {
  const [fields, setFields] = useState<CustomerFieldConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCustomerFields();
  }, []);

  const loadCustomerFields = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_field_config')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setFields(data || []);
    } catch (error: any) {
      console.error('Error loading customer fields:', error);
      toast({
        title: "Error",
        description: "Failed to load customer field configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = async (id: string, updates: Partial<CustomerFieldConfig>) => {
    try {
      const { error } = await supabase
        .from('customer_field_config')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setFields(prev => prev.map(field => 
        field.id === id ? { ...field, ...updates } : field
      ));

      toast({
        title: "Success",
        description: "Field configuration updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating field:', error);
      toast({
        title: "Error",
        description: "Failed to update field configuration",
        variant: "destructive",
      });
    }
  };

  const reorderFields = async (reorderedFields: CustomerFieldConfig[]) => {
    try {
      // Update display_order for each field
      const updates = reorderedFields.map((field, index) => ({
        id: field.id,
        display_order: index + 1
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('customer_field_config')
          .update({ display_order: update.display_order })
          .eq('id', update.id);

        if (error) throw error;
      }

      setFields(reorderedFields);
      
      toast({
        title: "Success",
        description: "Field order updated successfully",
      });
    } catch (error: any) {
      console.error('Error reordering fields:', error);
      toast({
        title: "Error",
        description: "Failed to update field order",
        variant: "destructive",
      });
    }
  };

  const refreshFields = async () => {
    await loadCustomerFields();
  };

  const value: CustomerFieldContextType = {
    fields,
    loading,
    updateField,
    reorderFields,
    refreshFields,
  };

  return (
    <CustomerFieldContext.Provider value={value}>
      {children}
    </CustomerFieldContext.Provider>
  );
};

export const useCustomerFields = (): CustomerFieldContextType => {
  const context = useContext(CustomerFieldContext);
  if (!context) {
    throw new Error('useCustomerFields must be used within a CustomerFieldProvider');
  }
  return context;
};