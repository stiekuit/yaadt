
import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  userRole: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Log authentication events
        if (event === 'SIGNED_IN' && session?.user) {
          logAuthEvent('login', session.user.email || '', true);
        } else if (event === 'SIGNED_OUT') {
          logAuthEvent('logout', user?.email || '', true);
        } else if (event === 'USER_UPDATED' && session?.user) {
          logAuthEvent('email_change', session.user.email || '', true);
        }
        
        if (session?.user) {
          // Defer profile and role loading to prevent deadlocks
          setTimeout(() => {
            loadUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            role
          )
        `)
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      setProfile(profileData);
      setUserRole(profileData?.user_roles?.[0]?.role || 'user');
    } catch (error) {
      console.error('Error loading user profile:', error);
      setProfile(null);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  const logAuthEvent = async (
    eventType: 'login' | 'logout' | 'signup' | 'failed_login' | 'password_reset' | 'email_change',
    email: string,
    success: boolean,
    failureReason?: string
  ) => {
    try {
      await supabase.from('auth_audit_logs' as any).insert({
        event_type: eventType,
        email,
        success,
        failure_reason: failureReason,
        user_agent: navigator.userAgent,
        ip_address: null,
        session_id: session?.access_token,
        user_id: user?.id
      } as any);
    } catch (error) {
      console.error('Error logging auth event:', error);
    }
  };

  const signOut = async () => {
    try {
      await logAuthEvent('logout', user?.email || 'unknown', true);
      await supabase.auth.signOut();
      navigate('/'); // Redirect to landing page instead of auth
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      userRole,
      loading,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
