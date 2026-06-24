import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { bannersApiRef, Banner } from '../api/BannersClient';

const STORAGE_KEY_PREFIX = 'backstage.banner.';
const DISMISS_TTL_MS = 60 * 60 * 1000; 

function getDismissedAt(id: string): number | null {
  try {
    const val = localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
    return val ? parseInt(val, 10) : null;
  } catch {
    return null;
  }
}

function isCurrentlyDismissed(id: string): boolean {
  const dismissedAt = getDismissedAt(id);
  if (dismissedAt === null) return false;
  return Date.now() - dismissedAt < DISMISS_TTL_MS;
}

function persist(id: string): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${id}`, String(Date.now()));
  } catch { /* noop */ }
}

export function useActiveBanners() {
  const bannersApi = useApi(bannersApiRef);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  useEffect(() => {
    let cancelled = false;
    bannersApi.getActive().then(data => {
      if (!cancelled) {
        setBanners(data);
        setDismissed(new Set(data.map(b => b.id).filter(isCurrentlyDismissed)));
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [bannersApi]);
  useEffect(() => {
    const tick = () =>
      setDismissed(new Set(banners.map(b => b.id).filter(isCurrentlyDismissed)));
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, [banners]);
  useEffect(() => {
    const handler = () =>
      setDismissed(new Set(banners.map(b => b.id).filter(isCurrentlyDismissed)));
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [banners]);

  const dismiss = useCallback((id: string) => {
    persist(id);
    setDismissed(prev => new Set([...prev, id]));
  }, []);

  const activeBanners = banners.filter(b => !dismissed.has(b.id));

  return { activeBanners, dismiss, loading };
}