import { useState, useEffect, useCallback } from 'react';
import { banners, BannerConfig } from './bannerConfig';

const STORAGE_KEY_PREFIX = 'backstage.banner.';
const DISMISS_TTL_MS = 60 * 60 * 1000; // 1 hour

function isBannerActive(banner: BannerConfig): boolean {
  const now = Date.now();
  const from = new Date(banner.activeFrom).getTime();
  const to = new Date(banner.activeTo).getTime();
  return now >= from && now <= to;
}

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
  } catch {
    // localStorage unavailable — graceful no-op
  }
}

// function clearDismissed(id: string): void {
//   try {
//     localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
//   } catch {}
// }

export function useActiveBanners() {
  const [dismissed, setDismissed] = useState<Set<string>>(
    () => new Set(banners.map(b => b.id).filter(isCurrentlyDismissed)),
  );

  // Re-evaluate dismissals — clears expired ones every minute
  useEffect(() => {
    const tick = () => {
      setDismissed(new Set(banners.map(b => b.id).filter(isCurrentlyDismissed)));
    };
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Sync dismissals across tabs
  useEffect(() => {
    const handler = () => {
      setDismissed(new Set(banners.map(b => b.id).filter(isCurrentlyDismissed)));
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const dismiss = useCallback((id: string) => {
    persist(id);
    setDismissed(prev => new Set([...prev, id]));
  }, []);

  const activeBanners = banners.filter(
    b => isBannerActive(b) && !dismissed.has(b.id),
  );

  return { activeBanners, dismiss };
}