
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useFreshdesk } from '@/contexts/FreshdeskContext';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle } from 'lucide-react';

interface AddNoteSectionProps {
  ticketId: number;
  onNoteAdded?: () => void;
}

const AddNoteSection = ({ ticketId, onNoteAdded }: AddNoteSectionProps) => {
  const [noteBody, setNoteBody] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { addNoteToTicket } = useFreshdesk();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteBody.trim()) return;

    setSubmitting(true);
    try {
      const success = await addNoteToTicket(ticketId, {
        body: noteBody,
        private: isPrivate,
      });

      if (success) {
        setNoteBody('');
        onNoteAdded?.();
        toast({
          title: "Success",
          description: "Note added successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <MessageCircle className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold">Add Note</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="note-body">Note Content</Label>
          <Textarea
            id="note-body"
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            placeholder="Add your note here..."
            rows={4}
            className="mt-1"
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="private-note"
            checked={isPrivate}
            onCheckedChange={setIsPrivate}
          />
          <Label htmlFor="private-note">Private note (internal only)</Label>
        </div>

        <Button type="submit" disabled={submitting || !noteBody.trim()}>
          {submitting ? 'Adding Note...' : 'Add Note'}
        </Button>
      </form>
    </div>
  );
};

export default AddNoteSection;
