import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Toaster as SonnerToaster } from 'sonner';

// ponytail: above dialog overlay (z-[9999]) and content (z-[10000])
const TOASTER_Z_INDEX = 10001;

export function Toaster() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return createPortal(
        <SonnerToaster
            position="top-right"
            richColors
            closeButton
            style={{ zIndex: TOASTER_Z_INDEX }}
            toastOptions={{
                classNames: {
                    toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
                    description: 'group-[.toast]:text-muted-foreground',
                    actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
                    cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
                },
            }}
        />,
        document.body
    );
}
