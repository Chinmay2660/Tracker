import { useState, useEffect, useCallback, useRef } from 'react';
export const useOnlineStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const checkConnectivity = useCallback(async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            await fetch('/favicon.svg?check=' + Date.now(), {
                method: 'HEAD',
                cache: 'no-store',
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            setIsOnline(true);
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
                checkIntervalRef.current = null;
            }
        }
        catch {
            setIsOnline(false);
        }
    }, []);
    const startChecking = useCallback(() => {
        if (!checkIntervalRef.current) {
            checkIntervalRef.current = setInterval(checkConnectivity, 5000);
        }
    }, [checkConnectivity]);
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
                checkIntervalRef.current = null;
            }
        };
        const handleOffline = () => {
            setIsOnline(false);
            startChecking();
        };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && !navigator.onLine) {
                checkConnectivity();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
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
