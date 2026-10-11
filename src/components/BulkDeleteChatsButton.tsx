
import React, { useState } from 'react';
import { Eraser, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BulkDeleteChatsButtonProps {
  emptyChatsCount: number;
  onDeleteComplete: () => void;
}

const BulkDeleteChatsButton = ({ emptyChatsCount, onDeleteComplete }: BulkDeleteChatsButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deletedCount, setDeletedCount] = useState(0);
  const [isCancelled, setIsCancelled] = useState(false);
  const { toast } = useToast();

  const batchDeleteEmptyChats = async () => {
    setIsDeleting(true);
    setProgress(0);
    setDeletedCount(0);
    setIsCancelled(false);

    try {
      const batchSize = 50; // Reduced for better performance
      let totalDeleted = 0;
      let remainingSessions = emptyChatsCount;

      while (remainingSessions > 0 && !isCancelled) {
        // Get current empty chat sessions in batches
        const { data: emptySessions, error: fetchError } = await supabase
          .from('chat_sessions')
          .select('id')
          .eq('title', 'New Chat')
          .limit(Math.min(batchSize, remainingSessions));

        if (fetchError) {
          console.error('Error fetching empty sessions:', fetchError);
          throw fetchError;
        }

        if (!emptySessions || emptySessions.length === 0) {
          // No more empty sessions found
          break;
        }

        // Delete messages for these sessions first
        const sessionIds = emptySessions.map(session => session.id);
        
        const { error: messagesDeleteError } = await supabase
          .from('chat_messages')
          .delete()
          .in('session_id', sessionIds);

        if (messagesDeleteError) {
          console.error('Error deleting messages:', messagesDeleteError);
          throw messagesDeleteError;
        }

        // Delete the sessions
        const { error: sessionsDeleteError } = await supabase
          .from('chat_sessions')
          .delete()
          .in('id', sessionIds);

        if (sessionsDeleteError) {
          console.error('Error deleting sessions:', sessionsDeleteError);
          throw sessionsDeleteError;
        }

        totalDeleted += emptySessions.length;
        remainingSessions -= emptySessions.length;
        setDeletedCount(totalDeleted);
        setProgress((totalDeleted / emptyChatsCount) * 100);

        // Small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      if (isCancelled) {
        toast({
          title: "Operation Cancelled",
          description: `Deleted ${totalDeleted} sessions before cancellation`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Deleted ${totalDeleted} empty chat sessions`,
        });
      }

      setIsOpen(false);
      onDeleteComplete();
    } catch (error) {
      console.error('Error deleting empty chats:', error);
      toast({
        title: "Error",
        description: `Failed to delete empty chats. Deleted ${deletedCount} sessions before error.`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setProgress(0);
      setDeletedCount(0);
      setIsCancelled(false);
    }
  };

  const handleCancel = () => {
    if (isDeleting) {
      setIsCancelled(true);
    } else {
      setIsOpen(false);
    }
  };

  if (emptyChatsCount === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="w-full text-xs">
          <Eraser className="w-3 h-3 mr-2" />
          Clear {emptyChatsCount} Empty Chat{emptyChatsCount > 1 ? 's' : ''}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Empty Chat Sessions</DialogTitle>
          <DialogDescription>
            This will permanently delete {emptyChatsCount} empty chat sessions titled "New Chat". 
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        {isDeleting && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              {isCancelled ? 'Cancelling...' : `Deleting ${deletedCount} of ${emptyChatsCount} sessions...`}
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isDeleting && isCancelled}
          >
            {isDeleting ? 'Cancel' : 'Close'}
          </Button>
          <Button 
            variant="destructive" 
            onClick={batchDeleteEmptyChats}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete {emptyChatsCount} Sessions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkDeleteChatsButton;
