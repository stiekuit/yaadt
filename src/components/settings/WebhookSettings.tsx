import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useConfig } from '@/contexts/ConfigContext';
import { WebhookConfig } from '@/types/config';
import ApiTester from './ApiTester';

const WebhookSettings = () => {
  const { webhookConfigs, activeSupportWebhook, activeGeneralWebhook, saveWebhookConfig, updateWebhookConfig, deleteWebhookConfig, testWebhookConnection } = useConfig();
  const [isAdding, setIsAdding] = useState(false);
  const [newConfig, setNewConfig] = useState<Omit<WebhookConfig, 'id'>>({
    name: '',
    url: '',
    is_active: false,
    chat_type: 'support',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedConfig, setEditedConfig] = useState<Partial<WebhookConfig>>({});
  const [testingId, setTestingId] = useState<string | null>(null);

  // Group webhooks by chat type
  const supportWebhooks = webhookConfigs.filter(w => w.chat_type === 'support' || !w.chat_type);
  const generalWebhooks = webhookConfigs.filter(w => w.chat_type === 'general');

  const handleAdd = async () => {
    const success = await saveWebhookConfig(newConfig);
    if (success) {
      setIsAdding(false);
      setNewConfig({ name: '', url: '', is_active: false, chat_type: 'support' });
    }
  };

  const handleEdit = (config: WebhookConfig) => {
    setEditingId(config.id);
    setEditedConfig({ ...config });
  };

  const handleUpdate = async () => {
    if (editingId) {
      const success = await updateWebhookConfig(editingId, editedConfig);
      if (success) {
        setEditingId(null);
        setEditedConfig({});
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this webhook configuration?')) {
      await deleteWebhookConfig(id);
    }
  };

  const handleQuickTest = async (url: string, configId: string, chatType: 'support' | 'general') => {
    setTestingId(configId);
    try {
      // Create a realistic test payload that matches what actual chat messages send
      const realisticTestPayload = {
        message: 'Test connection from webhook settings',
        timestamp: new Date().toISOString(),
        userId: 'support-portal-user',
        sessionId: `test-session-${Date.now()}`,
        chatType: chatType,
        sessionTitle: 'Test Chat Session',
        userAgent: navigator.userAgent,
        source: 'webhook-test'
      };

      await testWebhookConnection(url, 'POST', realisticTestPayload);
    } finally {
      setTestingId(null);
    }
  };

  const renderWebhookGroup = (webhooks: WebhookConfig[], title: string, chatType: 'support' | 'general') => {
    const isActiveWebhook = chatType === 'support' ? activeSupportWebhook : activeGeneralWebhook;
    
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <div className="flex items-center space-x-2">
            {isActiveWebhook ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Active: {isActiveWebhook.name}</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <XCircle className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">No active webhook</span>
              </div>
            )}
          </div>
        </div>
        {webhooks.length > 0 ? (
          <div className="grid gap-4">
            {webhooks.map((config) => (
              <div key={config.id} className={`p-4 border rounded-md bg-white ${config.is_active ? 'ring-2 ring-green-200 bg-green-50' : ''}`}>
                {editingId === config.id ? (
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <Input
                        type="text"
                        value={editedConfig.name || ''}
                        onChange={(e) => setEditedConfig({ ...editedConfig, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">URL</label>
                      <Input
                        type="url"
                        value={editedConfig.url || ''}
                        onChange={(e) => setEditedConfig({ ...editedConfig, url: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Chat Type</label>
                      <select
                        value={editedConfig.chat_type || 'support'}
                        onChange={e => setEditedConfig({ ...editedConfig, chat_type: e.target.value as 'support' | 'general' })}
                        className="w-full px-2 py-1 border rounded"
                      >
                        <option value="support">Support Chat</option>
                        <option value="general">General Chat</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={editedConfig.is_active || false}
                        onCheckedChange={(checked) => setEditedConfig({ ...editedConfig, is_active: checked })}
                      />
                      <label className="text-sm font-medium text-gray-700">Active</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={editedConfig.allow_guest_access || false}
                        onCheckedChange={(checked) => setEditedConfig({ ...editedConfig, allow_guest_access: checked })}
                      />
                      <label className="text-sm font-medium text-gray-700">Allow Guest Access</label>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                      <Button onClick={handleUpdate}>
                        <Save className="w-4 h-4 mr-2" />
                        Update
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold">{config.name}</h4>
                        {config.is_active && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Active for {config.chat_type === 'general' ? 'General Chat' : 'Support Chat'}
                          </span>
                        )}
                        {config.allow_guest_access && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Guest Access
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{config.url}</p>
                      <p className="text-xs text-gray-500">
                        Type: {config.chat_type === 'general' ? 'General Chat' : 'Support Chat'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickTest(config.url, config.id, config.chat_type || 'support')}
                        disabled={testingId === config.id}
                      >
                        {testingId === config.id ? (
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />
                        ) : (
                          <TestTube className="w-4 h-4 mr-2" />
                        )}
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(config)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(config.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No {title.toLowerCase()} webhooks configured.</p>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Webhook Configurations</h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure separate webhooks for Support Chat and General Chat. <strong>Both webhook types can be active simultaneously</strong> - one for Support Chat and one for General Chat.
        </p>
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>How it works:</strong> When users start a Support Chat, messages are sent to the active Support webhook. When they start a General Chat, messages are sent to the active General webhook.
          </p>
        </div>
      </div>

      {/* Add Webhook Section */}
      {isAdding ? (
        <div className="mb-6 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">Add New Webhook</h3>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <Input
                type="text"
                value={newConfig.name}
                onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
                placeholder="e.g., Production Support Bot"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">URL</label>
              <Input
                type="url"
                value={newConfig.url}
                onChange={(e) => setNewConfig({ ...newConfig, url: e.target.value })}
                placeholder="https://your-webhook-endpoint.com/webhook"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Chat Type</label>
              <select
                value={newConfig.chat_type}
                onChange={e => setNewConfig({ ...newConfig, chat_type: e.target.value as 'support' | 'general' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="support">Support Chat</option>
                <option value="general">General Chat</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newConfig.is_active}
                onCheckedChange={(checked) => setNewConfig({ ...newConfig, is_active: checked })}
              />
              <label className="text-sm font-medium text-gray-700">Set as active webhook for this chat type</label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newConfig.allow_guest_access || false}
                onCheckedChange={(checked) => setNewConfig({ ...newConfig, allow_guest_access: checked })}
              />
              <label className="text-sm font-medium text-gray-700">Allow guest access (unauthenticated users)</label>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-800">
                <strong>Security Note:</strong> Enabling guest access allows unauthenticated users to send messages to this webhook. Only enable this for webhooks designed to handle public traffic.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="ghost" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={!newConfig.name || !newConfig.url}>
                <Save className="w-4 h-4 mr-2" />
                Save Webhook
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button onClick={() => setIsAdding(true)} className="mb-6">
          <Plus className="w-4 h-4 mr-2" />
          Add New Webhook
        </Button>
      )}

      {/* Webhook Groups */}
      {renderWebhookGroup(supportWebhooks, 'Support Chat Webhooks', 'support')}
      {renderWebhookGroup(generalWebhooks, 'General Chat Webhooks', 'general')}

      {/* Advanced Testing Section */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Advanced Webhook Testing</h3>
        <ApiTester />
      </div>
    </div>
  );
};

export default WebhookSettings;
