import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface AccessRequest {
  id: string;
  requester_name: string;
  requester_email: string;
  requester_organization: string | null;
  request_message: string;
  status: 'pending' | 'approved' | 'denied';
  created_at: string;
  reviewed_at: string | null;
}

export const AdminAccessRequests = () => {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [denyReason, setDenyReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showDenyDialog, setShowDenyDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAccessRequests();
  }, []);

  const loadAccessRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('access_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data || []) as AccessRequest[]);
    } catch (error: any) {
      console.error('Error loading access requests:', error);
      toast({
        title: "Error",
        description: "Failed to load access requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: AccessRequest) => {
    setActionLoading(true);
    try {
      // Generate random password
      const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-8).toUpperCase();

      // Create user account via Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: request.requester_email,
        password: tempPassword,
        options: {
          data: {
            full_name: request.requester_name,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Update request status
      const { error: updateError } = await supabase
        .from('access_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      // TODO: Send approval email with credentials via edge function
      // For now, show the credentials to admin
      toast({
        title: "Request Approved",
        description: `Account created for ${request.requester_email}. Temporary password: ${tempPassword}`,
        duration: 10000,
      });

      await loadAccessRequests();
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve request",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeny = async () => {
    if (!selectedRequest) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('access_requests')
        .update({
          status: 'denied',
          reviewed_at: new Date().toISOString(),
          deny_reason: denyReason || null,
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({
        title: "Request Denied",
        description: `Access request from ${selectedRequest.requester_name} has been denied`,
      });

      setShowDenyDialog(false);
      setDenyReason('');
      setSelectedRequest(null);
      await loadAccessRequests();
    } catch (error: any) {
      console.error('Error denying request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to deny request",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'denied':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Denied</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Access Requests</CardTitle>
          <CardDescription>
            Review and manage account access requests from users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No access requests found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.requester_name}</TableCell>
                    <TableCell>{request.requester_email}</TableCell>
                    <TableCell>{request.requester_organization || '-'}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleApprove(request)}
                            disabled={actionLoading}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowDenyDialog(true);
                            }}
                            disabled={actionLoading}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Deny
                          </Button>
                        </div>
                      )}
                      {request.status !== 'pending' && (
                        <span className="text-sm text-muted-foreground">
                          {request.reviewed_at ? new Date(request.reviewed_at).toLocaleDateString() : '-'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDenyDialog} onOpenChange={setShowDenyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Access Request</DialogTitle>
            <DialogDescription>
              Provide a reason for denying {selectedRequest?.requester_name}'s access request (optional)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="denyReason">Reason (optional)</Label>
              <Textarea
                id="denyReason"
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                placeholder="e.g., Insufficient information provided, not authorized, etc."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDenyDialog(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeny}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Denying...
                </>
              ) : (
                'Confirm Deny'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
