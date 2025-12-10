import { WifiOff, RefreshCw, Cloud, CloudOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useEffect, useState } from 'react';

export default function OfflinePage() {
  const isOnline = useOnlineStatus();
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (isOnline) {
      // Reload page when back online - the App will handle routing
      window.location.reload();
    }
  }, [isOnline]);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      if (navigator.onLine) {
        window.location.reload();
      } else {
        setIsRetrying(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating clouds */}
        <div className="absolute top-20 left-10 opacity-20 dark:opacity-10 animate-float-slow">
          <Cloud className="w-24 h-24 text-slate-400" />
        </div>
        <div className="absolute top-40 right-20 opacity-15 dark:opacity-5 animate-float-delayed">
          <Cloud className="w-32 h-32 text-slate-400" />
        </div>
        <div className="absolute bottom-32 left-1/4 opacity-10 dark:opacity-5 animate-float">
          <CloudOff className="w-20 h-20 text-slate-400" />
        </div>
        <div className="absolute top-1/3 right-1/4 opacity-10 dark:opacity-5 animate-float-slow">
          <Cloud className="w-16 h-16 text-slate-400" />
        </div>
        
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/10 to-orange-500/10 dark:from-red-500/5 dark:to-orange-500/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-slate-500/10 to-slate-400/10 dark:from-slate-500/5 dark:to-slate-400/5 rounded-full blur-3xl animate-pulse-delayed" />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center space-y-8 max-w-lg">
        {/* Icon with animated rings */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Pulsing rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-2 border-red-400/30 dark:border-red-500/20 animate-ping-slow" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full border border-red-400/20 dark:border-red-500/10 animate-ping-slower" />
            </div>
            
            {/* Main icon container */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 dark:from-red-500/10 dark:to-orange-500/10 rounded-full blur-xl" />
              <div className="relative bg-white dark:bg-slate-900 rounded-full p-6 shadow-2xl shadow-red-500/10 dark:shadow-red-500/5 border border-slate-200 dark:border-slate-800">
                <WifiOff className="h-12 w-12 text-red-500 dark:text-red-400" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>

        {/* Text content */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            You're Offline
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Looks like you've lost your internet connection. Check your network and try again.
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className={`relative h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}>
              <div className={`absolute inset-0 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'} animate-ping`} />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {isOnline ? 'Back Online!' : 'No Connection'}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button 
            onClick={handleRetry} 
            disabled={isRetrying}
            className="gap-2 px-6 py-5 text-base bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-0 shadow-lg shadow-emerald-500/25 dark:shadow-emerald-500/15 transition-all duration-300 hover:scale-105"
          >
            <RefreshCw className={`h-5 w-5 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Checking...' : 'Try Again'}
          </Button>
        </div>

        {/* Tips */}
        <div className="pt-4">
          <div className="inline-block bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl px-6 py-4 border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Quick Tips
            </h3>
            <ul className="text-sm text-slate-500 dark:text-slate-400 space-y-1 text-left">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-slate-400 rounded-full" />
                Check if Wi-Fi or mobile data is enabled
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-slate-400 rounded-full" />
                Try moving closer to your router
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-slate-400 rounded-full" />
                Restart your network device
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* CSS for custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-30px) translateX(-15px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-25px) translateX(20px); }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes ping-slower {
          0% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes pulse-delayed {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.15); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite 1s; }
        .animate-ping-slow { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-ping-slower { animation: ping-slower 2.5s cubic-bezier(0, 0, 0.2, 1) infinite 0.5s; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-pulse-delayed { animation: pulse-delayed 5s ease-in-out infinite 1s; }
      `}</style>
    </div>
  );
}
