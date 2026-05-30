import { registerSW } from 'virtual:pwa-register';

/**
 * Registers the service worker in production only. When a new version is
 * waiting, we dispatch `sw-update-available` carrying a `reload` callback;
 * the UpdateBanner turns that into a visible "Reload to update" prompt and
 * only activates the new worker when the user clicks. Mirrors the controlled
 * update flow from the time-boxing PWA.
 */
export function setupPWA(): void {
  if (import.meta.env.DEV) return;

  const updateSW = registerSW({
    onNeedRefresh() {
      window.dispatchEvent(
        new CustomEvent('sw-update-available', {
          detail: { reload: () => updateSW(true) },
        }),
      );
    },
    onOfflineReady() {
      window.dispatchEvent(new CustomEvent('sw-offline-ready'));
    },
  });
}
