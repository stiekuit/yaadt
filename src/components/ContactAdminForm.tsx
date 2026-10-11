import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Loader2, Mail } from 'lucide-react';
import { z } from 'zod';

// Input validation schema
const accessRequestSchema = z.object({
  fullName: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z.string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase(),
  organization: z.string()
    .trim()
    .max(200, 'Organization name must be less than 200 characters')
    .optional(),
  message: z.string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
});

export const ContactAdminForm = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validate input
      const validatedData = accessRequestSchema.parse({
        fullName,
        email,
        organization,
        message,
      });

      // Create access request record
      const { error: insertError } = await supabase
        .from('access_requests')
        .insert({
          requester_name: validatedData.fullName,
          requester_email: validatedData.email,
          requester_organization: validatedData.organization || null,
          request_message: validatedData.message,
          status: 'pending',
        });

      if (insertError) throw insertError;

      // Call edge function to send email to admins
      const { error: emailError } = await supabase.functions.invoke('send-access-request', {
        body: {
          requester_name: validatedData.fullName,
          requester_email: validatedData.email,
          requester_organization: validatedData.organization,
          request_message: validatedData.message,
        },
      });

      if (emailError) {
        console.error('Email sending error:', emailError);
        // Don't throw - request is saved, email failure is secondary
      }

      setSubmitted(true);
      toast({
        title: "Request Submitted",
        description: "An administrator will review your request and contact you soon.",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast({
          title: "Validation Error",
          description: "Please check the form for errors.",
          variant: "destructive",
        });
      } else {
        let errorMessage = "Failed to submit request. Please try again.";
        if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
          errorMessage = "You've already submitted a request. Please wait for admin approval.";
        }

        toast({
          title: "Submission Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="flex justify-center">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h3 className="text-lg font-semibold">Request Submitted Successfully</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Thank you for your interest! An administrator will review your request and send you
          account credentials via email if approved.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setSubmitted(false);
            setFullName('');
            setEmail('');
            setOrganization('');
            setMessage('');
          }}
        >
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name *</Label>
        <Input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          placeholder="John Doe"
          maxLength={100}
          className={errors.fullName ? 'border-red-500' : ''}
        />
        {errors.fullName && (
          <p className="text-sm text-red-500">{errors.fullName}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="john@example.com"
          maxLength={255}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="organization">Organization (Optional)</Label>
        <Input
          id="organization"
          type="text"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          placeholder="Your Company Name"
          maxLength={200}
          className={errors.organization ? 'border-red-500' : ''}
        />
        {errors.organization && (
          <p className="text-sm text-red-500">{errors.organization}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Reason for Access *</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          placeholder="Please describe why you need access to this system..."
          rows={4}
          maxLength={1000}
          className={errors.message ? 'border-red-500' : ''}
        />
        {errors.message && (
          <p className="text-sm text-red-500">{errors.message}</p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Admin Approval Required</p>
            <p className="text-blue-700">
              Your request will be sent to system administrators for review. If approved,
              you'll receive login credentials via email.
            </p>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting Request...
          </>
        ) : (
          <>
            <Mail className="w-4 h-4 mr-2" />
            Submit Access Request
          </>
        )}
      </Button>
    </form>
  );
};
