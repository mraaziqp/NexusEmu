import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWAInstallState {
  canInstall: boolean;       // true = Chrome/Edge on desktop/Android, prompt ready
  isIOS: boolean;            // true = Safari on iOS, must use manual flow
  isInstalled: boolean;      // already running in standalone mode
  promptInstall: () => Promise<boolean>; // returns true if user accepted
}

export function usePWAInstall(): PWAInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall]         = useState(false);

  const isIOS = /iphone|ipad|ipod/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  );

  const isInstalled =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true);

  useEffect(() => {
    if (isInstalled) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Also mark if already installable (some browsers fire event before listeners attach)
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isInstalled]);

  // Clear prompt after install
  useEffect(() => {
    const handler = () => setCanInstall(false);
    window.addEventListener('appinstalled', handler);
    return () => window.removeEventListener('appinstalled', handler);
  }, []);

  const promptInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);
    return outcome === 'accepted';
  };

  return { canInstall, isIOS, isInstalled, promptInstall };
}
