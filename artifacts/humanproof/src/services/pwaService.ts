// pwaService.ts
// PWA installation and service worker management.

let deferredPrompt: any = null;

export async function registerServiceWorker(): Promise<void> {
  if (typeof window === 'undefined' || import.meta.env.DEV) return;
  if (!('serviceWorker' in navigator)) return;

  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      if (!newWorker) return;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          window.dispatchEvent(new CustomEvent('pwa-update-available'));
        }
      });
    });
  } catch (err) {
    console.error('[PWA] Service worker registration failed:', err);
  }
}

export function canPromptInstall(): boolean {
  return deferredPrompt !== null;
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;
  try {
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    deferredPrompt = null;
    return result.outcome === 'accepted';
  } catch {
    return false;
  }
}

export function dismissInstallPrompt(): void {
  deferredPrompt = null;
}

export function applyServiceWorkerUpdate(): void {
  if (!navigator.serviceWorker.controller) return;
  navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  window.location.reload();
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: any) => {
    e.preventDefault();
    deferredPrompt = e;
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  });
}
