
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FreshdeskGroup } from '@/types/freshdesk';
import { useFreshdesk } from '@/contexts/FreshdeskContext';
import { supabase } from '@/integrations/supabase/client';

interface GroupSelectorProps {
  value?: number | string;
  onChange: (groupId: string) => void;
  label?: string;
  className?: string;
}

const GroupSelector = ({ value, onChange, label = "Group Assignment", className }: GroupSelectorProps) => {
  const [groups, setGroups] = useState<FreshdeskGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const { activeFreshdesk } = useFreshdesk();

  useEffect(() => {
    if (activeFreshdesk) {
      loadGroups();
    }
  }, [activeFreshdesk]);

  const loadGroups = async () => {
    if (!activeFreshdesk) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('freshdesk-proxy', {
        body: {
          endpoint: '/groups',
          method: 'GET'
        }
      });

      if (error) {
        console.error('Error loading groups:', error);
        return;
      }

      if (data && Array.isArray(data)) {
        setGroups(data);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <Label htmlFor="group-selector">{label}</Label>
      <Select
        value={value?.toString() || 'no_group'}
        onValueChange={onChange}
        disabled={loading}
      >
        <SelectTrigger className="mt-1">
          <SelectValue placeholder={loading ? "Loading groups..." : "Select group"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="no_group">No group assigned</SelectItem>
          {groups.map((group) => (
            <SelectItem key={group.id} value={group.id.toString()}>
              {group.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default GroupSelector;
