import { registerSW } from 'virtual:pwa-register';

/**
 * Registers the service worker in production only (off in dev for clean HMR).
 * With `registerType: 'autoUpdate'`, a new build activates and reloads the
 * page automatically — no user prompt.
 */
export function setupPWA(): void {
  if (import.meta.env.DEV) return;
  registerSW({ immediate: true });
}
