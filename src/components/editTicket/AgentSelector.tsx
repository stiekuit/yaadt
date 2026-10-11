
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FreshdeskAgent } from '@/types/freshdesk';
import { useFreshdesk } from '@/contexts/FreshdeskContext';
import { supabase } from '@/integrations/supabase/client';

interface AgentSelectorProps {
  value?: number | string;
  onChange: (agentId: string) => void;
  label?: string;
  className?: string;
}

const AgentSelector = ({ value, onChange, label = "Assigned Agent", className }: AgentSelectorProps) => {
  const [agents, setAgents] = useState<FreshdeskAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const { activeFreshdesk } = useFreshdesk();

  useEffect(() => {
    if (activeFreshdesk) {
      loadAgents();
    }
  }, [activeFreshdesk]);

  const loadAgents = async () => {
    if (!activeFreshdesk) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('freshdesk-proxy', {
        body: {
          endpoint: '/agents',
          method: 'GET'
        }
      });

      if (error) {
        console.error('Error loading agents:', error);
        return;
      }

      if (data && Array.isArray(data)) {
        setAgents(data.filter((agent: FreshdeskAgent) => agent.active));
      }
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <Label htmlFor="agent-selector">{label}</Label>
      <Select
        value={value?.toString() || 'unassigned'}
        onValueChange={onChange}
        disabled={loading}
      >
        <SelectTrigger className="mt-1">
          <SelectValue placeholder={loading ? "Loading agents..." : "Select agent"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned">Unassigned</SelectItem>
          {agents.map((agent) => (
            <SelectItem key={agent.id} value={agent.id.toString()}>
              {agent.contact.name} ({agent.contact.email})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AgentSelector;
