
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WebhookConfig } from '@/types/config';

export const useWebhookConfig = () => {
  const { toast } = useToast();

  const saveWebhookConfig = async (config: Omit<WebhookConfig, 'id'>): Promise<boolean> => {
    try {
      if (config.is_active) {
        // Only deactivate webhooks of the same chat_type
        await supabase
          .from('webhook_config')
          .update({ is_active: false })
          .eq('chat_type', config.chat_type || 'support')
          .neq('id', '');
      }

      const { error } = await supabase
        .from('webhook_config')
        .insert([config]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Webhook configuration saved successfully",
      });
      return true;
    } catch (error) {
      console.error('Error saving webhook config:', error);
      toast({
        title: "Error",
        description: "Failed to save webhook configuration",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateWebhookConfig = async (id: string, config: Partial<WebhookConfig>): Promise<boolean> => {
    try {
      if (config.is_active) {
        // Only deactivate webhooks of the same chat_type
        const currentConfig = await supabase
          .from('webhook_config')
          .select('chat_type')
          .eq('id', id)
          .single();
        
        if (currentConfig.data) {
          await supabase
            .from('webhook_config')
            .update({ is_active: false })
            .eq('chat_type', currentConfig.data.chat_type)
            .neq('id', id);
        }
      }

      const { error } = await supabase
        .from('webhook_config')
        .update(config)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Webhook configuration updated successfully",
      });
      return true;
    } catch (error) {
      console.error('Error updating webhook config:', error);
      toast({
        title: "Error",
        description: "Failed to update webhook configuration",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteWebhookConfig = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('webhook_config')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Webhook configuration deleted successfully",
      });
      return true;
    } catch (error) {
      console.error('Error deleting webhook config:', error);
      toast({
        title: "Error",
        description: "Failed to delete webhook configuration",
        variant: "destructive",
      });
      return false;
    }
  };

  const testWebhookConnection = async (url: string, method: 'GET' | 'POST' = 'POST', customBody?: any): Promise<any> => {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Testing webhook connection:', { url, method, customBody });
      
      const requestOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (method === 'POST') {
        const body = customBody || {
          message: 'Test connection',
          timestamp: new Date().toISOString(),
          userId: 'test-user',
        };
        requestOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, requestOptions);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      const responseText = await response.text();

      console.log('📨 Webhook test response:', {
        status: response.status,
        statusText: response.statusText,
        responseTime,
        body: responseText
      });

      const result = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        responseTime,
        responseText,
        headers: Object.fromEntries(response.headers.entries()),
      };

      if (response.ok) {
        toast({
          title: "Success",
          description: `Webhook connection test successful (${responseTime}ms)`,
        });
      } else {
        toast({
          title: "Error",
          description: `Webhook test failed: ${response.status} ${response.statusText}`,
          variant: "destructive",
        });
      }

      return result;
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.error('❌ Webhook test failed:', error);
      
      const result = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
      };

      toast({
        title: "Error",
        description: `Webhook connection test failed: ${result.error}`,
        variant: "destructive",
      });
      
      return result;
    }
  };

  return {
    saveWebhookConfig,
    updateWebhookConfig,
    deleteWebhookConfig,
    testWebhookConnection,
  };
};
