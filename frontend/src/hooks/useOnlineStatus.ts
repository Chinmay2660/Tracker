import { useState, useEffect, useCallback, useRef } from 'react';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check actual connectivity by making a small request
  const checkConnectivity = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      // Try to fetch favicon with cache-busting
      await fetch('/favicon.svg?check=' + Date.now(), {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      setIsOnline(true);
      
      // Stop checking if we're back online
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    } catch {
      setIsOnline(false);
    }
  }, []);

  // Start periodic checking when offline
  const startChecking = useCallback(() => {
    if (!checkIntervalRef.current) {
      checkIntervalRef.current = setInterval(checkConnectivity, 5000);
    }
  }, [checkConnectivity]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Stop checking when browser says we're online
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      // Start periodic checks when offline
      startChecking();
    };

    // Listen to browser events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check on visibility change (when user comes back to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !navigator.onLine) {
        checkConnectivity();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial check if browser reports offline
    if (!navigator.onLine) {
      startChecking();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [checkConnectivity, startChecking]);

  return isOnline;
};
