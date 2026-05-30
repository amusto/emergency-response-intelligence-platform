import { useEffect, useState } from 'react';

interface UpdateAvailableDetail {
  reload: () => void;
}

/**
 * Fixed toast shown when a new service-worker version is waiting. Listens for
 * the `sw-update-available` event dispatched from pwa.ts. "Reload" activates
 * the new worker (which reloads the page); "Later" dismisses for this session.
 */
export default function UpdateBanner() {
  const [reload, setReload] = useState<(() => void) | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<UpdateAvailableDetail>).detail;
      if (detail?.reload) {
        // Store as a function value (wrap so setState doesn't invoke it).
        setReload(() => detail.reload);
      }
    };
    window.addEventListener('sw-update-available', handler);
    return () => window.removeEventListener('sw-update-available', handler);
  }, []);

  if (!reload) return null;

  return (
    <div className="update-banner" role="status" aria-live="polite">
      <span>A new version is available.</span>
      <div className="update-banner-actions">
        <button className="clear-btn" onClick={() => setReload(null)}>
          Later
        </button>
        <button className="route-btn" onClick={() => reload()}>
          Reload
        </button>
      </div>
    </div>
  );
}
