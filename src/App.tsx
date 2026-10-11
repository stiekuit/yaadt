
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { SettingsProvider } from './contexts/SettingsContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { BrandingProvider } from './contexts/BrandingContext';
import { AppBrandingProvider } from './contexts/AppBrandingContext';
import { CustomerFieldProvider } from './contexts/CustomerFieldContext';
import { AppPermissionsProvider, useAppPermissions } from '@/contexts/AppPermissionsContext';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { guestChatAllowed, loading } = useAppPermissions();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        }
      />
      <Route 
        path="/" 
        element={
          guestChatAllowed ? (
            <Index />
          ) : (
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          )
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <BrandingProvider>
            <AppBrandingProvider>
              <SettingsProvider>
                <CustomerFieldProvider>
                  <AppPermissionsProvider>
                    <ConfigProvider>
                      <AppRoutes />
                      <Toaster />
                      <Sonner />
                    </ConfigProvider>
                  </AppPermissionsProvider>
                </CustomerFieldProvider>
              </SettingsProvider>
            </AppBrandingProvider>
          </BrandingProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  );
}


export default App;
