import { useEffect, useState, useCallback } from 'react';
import { GlobalBannerConfig, PageBannerConfig, BannerConfig } from './bannerTypes';

// ─── Import the static JSON directly ────────────────────────────────────────
// To switch to an API later, replace this import with a fetch() inside
// the useEffect below and remove the import.
import bannerConfigJson from './bannerConfig.json';

const STORAGE_PREFIX = 'backstage.banner.dismissed.';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isActive(activeFrom: string, activeTo: string): boolean {
  const now = Date.now();
  return now >= new Date(activeFrom).getTime() && now <= new Date(activeTo).getTime();
}

function readDismissed(id: string): boolean {
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}${id}`) === '1';
  } catch {
    return false;
  }
}

function writeDismissed(id: string): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${id}`, '1');
  } catch {
    // noop — private browsing
  }
}

/** Match the best page banner for the current pathname.
 *  Picks the banner whose longest route prefix matches. */
function matchPageBanner(
  pages: PageBannerConfig[],
  pathname: string,
): PageBannerConfig | null {
  let best: PageBannerConfig | null = null;
  let bestLen = -1;

  for (const page of pages) {
    for (const route of page.routes) {
      // Exact match OR prefix match followed by / or end-of-string
      const matches =
        pathname === route ||
        pathname.startsWith(route === '/' ? route : `${route}/`) ||
        (route === '/' && pathname.startsWith('/'));

      if (matches && route.length > bestLen) {
        best = page;
        bestLen = route.length;
      }
    }
  }

  return best;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface ActiveBanners {
  globalBanner: GlobalBannerConfig | null;
  pageBanner: PageBannerConfig | null;
  dismissGlobal: () => void;
  dismissPage: () => void;
}

export function useBanners(): ActiveBanners {
  // We load from static JSON synchronously; if you switch to fetch() set
  // config to null initially and populate it inside useEffect.
  const [config] = useState<BannerConfig>(() => bannerConfigJson as BannerConfig);

  // Track dismissed IDs in React state so dismissing re-renders immediately
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => {
    const set = new Set<string>();
    // Pre-populate from localStorage on mount
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_PREFIX)) {
          if (localStorage.getItem(key) === '1') {
            set.add(key.slice(STORAGE_PREFIX.length));
          }
        }
      }
    } catch {
      // noop
    }
    return set;
  });

  // Track pathname so banner updates on navigation without a page reload
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const sync = () => setPathname(window.location.pathname);

    window.addEventListener('popstate', sync);

    // Monkey-patch history so pushState/replaceState (used by React Router) trigger sync
    const origPush = window.history.pushState.bind(window.history);
    const origReplace = window.history.replaceState.bind(window.history);

    window.history.pushState = (...args) => { origPush(...args); sync(); };
    window.history.replaceState = (...args) => { origReplace(...args); sync(); };

    return () => {
      window.removeEventListener('popstate', sync);
      window.history.pushState = origPush;
      window.history.replaceState = origReplace;
    };
  }, []);

  // Sync dismissals made in other tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key?.startsWith(STORAGE_PREFIX) && e.newValue === '1') {
        const id = e.key.slice(STORAGE_PREFIX.length);
        setDismissedIds(prev => new Set([...prev, id]));
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const dismiss = useCallback((id: string) => {
    writeDismissed(id);
    setDismissedIds(prev => new Set([...prev, id]));
  }, []);

  // ── Resolve banners ──────────────────────────────────────────────────────

  const { global: globalConfig, pages } = config;

  const globalBanner =
    globalConfig &&
    isActive(globalConfig.activeFrom, globalConfig.activeTo) &&
    !dismissedIds.has(globalConfig.id)
      ? globalConfig
      : null;

  const matched = matchPageBanner(pages, pathname);
  const pageBanner =
    matched &&
    isActive(matched.activeFrom, matched.activeTo) &&
    !dismissedIds.has(matched.id)
      ? matched
      : null;

  return {
    globalBanner,
    pageBanner,
    dismissGlobal: () => globalBanner && dismiss(globalBanner.id),
    dismissPage: () => pageBanner && dismiss(pageBanner.id),
  };
}