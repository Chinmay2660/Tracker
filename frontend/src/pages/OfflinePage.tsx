import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function OfflinePage() {
  const isOnline = useOnlineStatus();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOnline) {
      // Redirect to dashboard when back online
      navigate('/dashboard', { replace: true });
    }
  }, [isOnline, navigate]);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="relative">
            <WifiOff className="h-24 w-24 text-muted-foreground" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 border-4 border-destructive border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">You're Offline</h1>
          <p className="text-muted-foreground">
            It looks like you've lost your internet connection. Please check your network settings and try again.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{isOnline ? 'Back Online' : 'Still Offline'}</span>
          </div>
          <Button onClick={handleRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  );
}

