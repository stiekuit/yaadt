
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWebhookConfig } from '@/hooks/useWebhookConfig';
import { WebhookConfig } from '@/types/config';

interface WebhookContextType {
  webhookConfigs: WebhookConfig[];
  activeWebhook: WebhookConfig | null; // Legacy compatibility
  activeSupportWebhook: WebhookConfig | null;
  activeGeneralWebhook: WebhookConfig | null;
  saveWebhookConfig: (config: Omit<WebhookConfig, 'id'>) => Promise<boolean>;
  updateWebhookConfig: (id: string, config: Partial<WebhookConfig>) => Promise<boolean>;
  deleteWebhookConfig: (id: string) => Promise<boolean>;
  testWebhookConnection: (url: string, method?: 'GET' | 'POST', customBody?: any) => Promise<any>;
}

const WebhookContext = createContext<WebhookContextType | undefined>(undefined);

export const useWebhook = (): WebhookContextType => {
  const context = useContext(WebhookContext);
  if (!context) {
    throw new Error('useWebhook must be used within a WebhookProvider');
  }
  return context;
};

interface WebhookProviderProps {
  children: ReactNode;
}

export const WebhookProvider = ({ children }: WebhookProviderProps) => {
  const [webhookConfigs, setWebhookConfigs] = useState<WebhookConfig[]>([]);
  const [activeSupportWebhook, setActiveSupportWebhook] = useState<WebhookConfig | null>(null);
  const [activeGeneralWebhook, setActiveGeneralWebhook] = useState<WebhookConfig | null>(null);

  const webhookHook = useWebhookConfig();

  useEffect(() => {
    loadWebhookConfigs();
  }, []);

  const loadWebhookConfigs = async () => {
    try {
      const { data: webhooks, error } = await supabase
        .from('webhook_config')
        .select('*');
      
      if (error) {
        console.error('Error fetching webhooks:', error);
        return;
      }

      // Ensure all webhooks have a chat_type (backward compatibility)
      const processedWebhooks = (webhooks || []).map((webhook: any) => ({
        ...webhook,
        chat_type: webhook.chat_type || 'support'
      }));

      setWebhookConfigs(processedWebhooks);
      
      // Set active webhooks separately by chat type
      // For guests, only show webhooks with allow_guest_access enabled
      const activeSupportWebhookData = processedWebhooks.find((webhook: WebhookConfig) => 
        webhook.is_active && 
        (webhook.chat_type === 'support' || !webhook.chat_type)
      ) || null;
      
      const activeGeneralWebhookData = processedWebhooks.find((webhook: WebhookConfig) => 
        webhook.is_active && webhook.chat_type === 'general'
      ) || null;

      setActiveSupportWebhook(activeSupportWebhookData);
      setActiveGeneralWebhook(activeGeneralWebhookData);

      console.log('🔗 Loaded webhook configurations:', {
        total: processedWebhooks.length,
        activeSupportWebhook: activeSupportWebhookData?.name,
        activeGeneralWebhook: activeGeneralWebhookData?.name,
        guestAccessEnabled: activeSupportWebhookData?.allow_guest_access || false
      });
    } catch (error) {
      console.error('Error in loadWebhookConfigs:', error);
    }
  };

  const value: WebhookContextType = {
    webhookConfigs,
    activeWebhook: activeSupportWebhook, // Legacy compatibility - defaults to support webhook
    activeSupportWebhook,
    activeGeneralWebhook,
    saveWebhookConfig: async (config) => {
      const result = await webhookHook.saveWebhookConfig(config);
      if (result) {
        await loadWebhookConfigs();
      }
      return result;
    },
    updateWebhookConfig: async (id, config) => {
      const result = await webhookHook.updateWebhookConfig(id, config);
      if (result) {
        await loadWebhookConfigs();
      }
      return result;
    },
    deleteWebhookConfig: async (id) => {
      const result = await webhookHook.deleteWebhookConfig(id);
      if (result) {
        await loadWebhookConfigs();
      }
      return result;
    },
    testWebhookConnection: webhookHook.testWebhookConnection,
  };

  return (
    <WebhookContext.Provider value={value}>
      {children}
    </WebhookContext.Provider>
  );
};
