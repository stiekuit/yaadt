
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useBranding } from '@/contexts/BrandingContext';
import LandingPageLogo from '@/components/LandingPageLogo';
import YaadtFooter from '@/components/YaadtFooter';
import { ContactAdminForm } from '@/components/ContactAdminForm';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { 
    siteName, 
    logoUrl, 
    landingPageStyle, 
    landingBackgroundColor,
    logoPlacement,
    showSiteNameOnLanding,
    loading: brandingLoading 
  } = useBranding();

  // Enhanced error handling function
  const getErrorMessage = (error: any): { title: string; description: string; isDeveloperError?: boolean } => {
    console.error('Authentication error:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      status: error.status
    });

    // Database constraint violations (tenant_id, profile creation issues)
    if (error.message?.includes('tenant_id') || error.message?.includes('not-null constraint')) {
      return {
        title: "Account Setup Error",
        description: "There's a configuration issue preventing account creation. Please contact support with error code: DB-TENANT",
        isDeveloperError: true
      };
    }

    // Network/connection errors
    if (error.message?.includes('Failed to fetch') || error.message?.includes('network')) {
      return {
        title: "Connection Error",
        description: "Unable to connect to the server. Please check your internet connection and try again.",
      };
    }

    // Email validation errors
    if (error.message?.includes('Invalid email') || error.message?.includes('email')) {
      return {
        title: "Invalid Email",
        description: "Please enter a valid email address.",
      };
    }

    // Password validation errors
    if (error.message?.includes('Password') || error.message?.includes('password')) {
      return {
        title: "Password Error",
        description: "Password must be at least 6 characters long and meet security requirements.",
      };
    }

    // User already exists
    if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
      return {
        title: "Account Exists",
        description: "An account with this email already exists. Try signing in instead.",
      };
    }

    // Rate limiting
    if (error.message?.includes('rate') || error.message?.includes('limit')) {
      return {
        title: "Too Many Attempts",
        description: "Please wait a moment before trying again.",
      };
    }

    // Generic database errors
    if (error.message?.includes('Database error') || error.code?.startsWith('5')) {
      return {
        title: "Server Error",
        description: "A server error occurred. Please try again or contact support if the problem persists.",
        isDeveloperError: true
      };
    }

    // Default fallback
    return {
      title: "Authentication Failed",
      description: error.message || "An unexpected error occurred. Please try again.",
      isDeveloperError: !error.message
    };
  };

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        window.location.href = '/';
      }
    });
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Please check your email to confirm your account.",
      });
    } catch (error: any) {
      const errorInfo = getErrorMessage(error);
      toast({
        title: errorInfo.title,
        description: errorInfo.description,
        variant: "destructive",
      });

      // Log additional debug info for developer errors
      if (errorInfo.isDeveloperError) {
        console.error('DEVELOPER DEBUG - Registration Error Details:', {
          originalError: error,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          email: email,
          fullName: fullName
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        window.location.href = '/';
      }
    } catch (error: any) {
      const errorInfo = getErrorMessage(error);
      toast({
        title: errorInfo.title,
        description: errorInfo.description,
        variant: "destructive",
      });

      // Log additional debug info for developer errors
      if (errorInfo.isDeveloperError) {
        console.error('DEVELOPER DEBUG - Sign In Error Details:', {
          originalError: error,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          email: email
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while branding is loading
  if (brandingLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Skeleton className="w-16 h-16 mx-auto mb-4 rounded-lg" />
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getPageLayoutClasses = () => {
    switch (landingPageStyle) {
      case 'full-logo':
        return 'min-h-screen flex flex-col items-center justify-center px-4';
      case 'centered':
        return 'min-h-screen flex items-center justify-center px-4';
      case 'split':
        return 'min-h-screen flex items-center justify-center lg:grid lg:grid-cols-2 lg:gap-8 px-4';
      default:
        return 'min-h-screen flex items-center justify-center px-4';
    }
  };

  const getContainerClasses = () => {
    switch (landingPageStyle) {
      case 'full-logo':
        return 'w-full max-w-sm';
      case 'split':
        return 'w-full max-w-md lg:max-w-sm';
      default:
        return 'w-full max-w-md';
    }
  };

  return (
    <div 
      className={getPageLayoutClasses()}
      style={{ backgroundColor: landingBackgroundColor }}
    >
      {/* Background logo for background placement */}
      {logoPlacement === 'background' && <LandingPageLogo />}
      
      {landingPageStyle === 'split' && (
        <div className="hidden lg:flex lg:items-center lg:justify-center">
          <LandingPageLogo className="max-w-xs" />
        </div>
      )}
      
      <div className={getContainerClasses()}>
        {logoPlacement !== 'background' && landingPageStyle !== 'split' && (
          <LandingPageLogo />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="contact">Contact Admin</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="contact">
                <ContactAdminForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Show logo on mobile for split layout */}
        {landingPageStyle === 'split' && (
          <div className="lg:hidden mt-8">
            <LandingPageLogo className="max-w-xs mx-auto" />
          </div>
        )}
      </div>
      
      <YaadtFooter />
    </div>
  );
};

export default Auth;
