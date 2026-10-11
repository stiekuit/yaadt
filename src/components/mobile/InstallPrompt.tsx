import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Only show if not already dismissed
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`Install prompt outcome: ${outcome}`);
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className={cn(
      "fixed bottom-20 left-4 right-4 z-50",
      "bg-background border border-border rounded-2xl shadow-2xl",
      "p-4 animate-in slide-in-from-bottom-4"
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <Download className="h-6 w-6 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">
            Install Payment24 Support
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Get faster access and work offline by installing our app
          </p>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleInstall}
              className="flex-1"
            >
              Install
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
            >
              Not now
            </Button>
          </div>
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="flex-shrink-0 h-8 w-8"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
