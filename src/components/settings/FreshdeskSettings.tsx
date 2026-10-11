
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useConfig } from '@/contexts/ConfigContext';
import { FreshdeskConfig } from '@/types/config';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const FreshdeskSettings = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<FreshdeskConfig | null>(null);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isActive, setIsActive] = useState(false);
  const { freshdeskConfigs, saveFreshdeskConfig, updateFreshdeskConfig, deleteFreshdeskConfig, testFreshdeskConnection } = useConfig();
  const { toast } = useToast();

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    clearForm();
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    clearForm();
  };

  const handleOpenEditModal = (config: FreshdeskConfig) => {
    setSelectedConfig(config);
    setName(config.name);
    setDomain(config.domain);
    setApiKey(config.api_key);
    setIsActive(config.is_active);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedConfig(null);
    clearForm();
  };

  const clearForm = () => {
    setName('');
    setDomain('');
    setApiKey('');
    setIsActive(false);
  };

  const handleSaveConfig = async () => {
    if (!name || !domain || !apiKey) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    const configData = {
      name,
      domain,
      api_key: apiKey,
      is_active: isActive,
    };

    const success = await saveFreshdeskConfig(configData);
    if (success) {
      handleCloseDialog();
    }
  };

  const handleUpdateConfig = async () => {
    if (!selectedConfig) return;

    if (!name || !domain || !apiKey) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    const configData = {
      name,
      domain,
      api_key: apiKey,
      is_active: isActive,
    };

    const success = await updateFreshdeskConfig(selectedConfig.id, configData);
    if (success) {
      handleCloseEditModal();
    }
  };

  const handleDeleteConfig = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this configuration?");
    if (confirmDelete) {
      await deleteFreshdeskConfig(id);
    }
  };

  const handleTestConnection = async () => {
    if (!domain || !apiKey) {
      toast({
        title: "Error",
        description: "Please fill in domain and API key to test the connection.",
        variant: "destructive",
      });
      return;
    }

    await testFreshdeskConnection(domain, apiKey);
  };

  return (
    <div>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Freshdesk Configurations</h2>
        <Button onClick={handleOpenDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Configuration
        </Button>
      </div>
      <div className="py-4">
        <div className="rounded-md border">
          <ScrollArea>
            <Table>
              <TableCaption>A list of your Freshdesk configurations.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Name</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {freshdeskConfigs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell className="font-medium">{config.name}</TableCell>
                    <TableCell>{config.domain}</TableCell>
                    <TableCell>{config.is_active ? 'Yes' : 'No'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditModal(config)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteConfig(config.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {freshdeskConfigs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No configurations found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </div>

      {/* Add Configuration Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Freshdesk Configuration</DialogTitle>
            <DialogDescription>
              Add a new Freshdesk configuration to connect to your Freshdesk account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="domain" className="text-right">
                Domain
              </label>
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="apiKey" className="text-right">
                API Key
              </label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="isActive" className="text-right">
                Active
              </label>
              <div className="col-span-3 flex items-center">
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveConfig}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Configuration Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Freshdesk Configuration</DialogTitle>
            <DialogDescription>
              Edit your Freshdesk configuration details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="editName" className="text-right">
                Name
              </label>
              <Input
                id="editName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="editDomain" className="text-right">
                Domain
              </label>
              <Input
                id="editDomain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="editApiKey" className="text-right">
                API Key
              </label>
              <Input
                id="editApiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="editIsActive" className="text-right">
                Active
              </label>
              <div className="col-span-3 flex items-center">
                <Switch
                  id="editIsActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={handleCloseEditModal}>
              Cancel
            </Button>
            <Button onClick={handleUpdateConfig}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-end mt-4">
        <Button variant="outline" size="sm" onClick={handleTestConnection}>
          <TestTube className="mr-2 h-4 w-4" />
          Test Connection
        </Button>
      </div>
    </div>
  );
};

export default FreshdeskSettings;
