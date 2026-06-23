import { useEffect, useState } from 'react';
import {
  useApi,
  configApiRef,
  ConfigApi,
} from '@backstage/core-plugin-api';

import {
  PageBannerConfig,
  GlobalBannerConfig,
} from '../components/PageBanner/pageBannerTypes';

function isActive(activeFrom: string, activeTo: string): boolean {
  const now = Date.now();

  return (
    now >= new Date(activeFrom).getTime() &&
    now <= new Date(activeTo).getTime()
  );
}

function isDismissed(id: string): boolean {
  try {
    return localStorage.getItem(`backstage.pagebanner.${id}`) === 'dismissed';
  } catch {
    return false;
  }
}

export function dismissPageBanner(id: string): void {
  try {
    localStorage.setItem(
      `backstage.pagebanner.${id}`,
      'dismissed',
    );
  } catch {
    // noop
  }
}

function readPageBannersFromConfig(
  configApi: ConfigApi,
): {
  global: GlobalBannerConfig | null;
  pages: PageBannerConfig[];
} {
  const result: {
    global: GlobalBannerConfig | null;
    pages: PageBannerConfig[];
  } = {
    global: null,
    pages: [],
  };

  try {
    const root = configApi.getOptionalConfig('pageBanners');

    if (!root) {
      return result;
    }

    const globalConfig = root.getOptionalConfig('global');

    if (globalConfig) {
      result.global = {
        id: globalConfig.getString('id'),
        title: globalConfig.getString('title'),
        message: globalConfig.getString('message'),
        imageUrl:
          globalConfig.getOptionalString('imageUrl') ?? undefined,
        ctaLabel:
          globalConfig.getOptionalString('ctaLabel') ?? undefined,
        ctaHref:
          globalConfig.getOptionalString('ctaHref') ?? undefined,
        activeFrom: globalConfig.getString('activeFrom'),
        activeTo: globalConfig.getString('activeTo'),
      };
    }

    const pageConfigs =
      root.getOptionalConfigArray('pages') ?? [];

    result.pages = pageConfigs.map(page => ({
      id: page.getString('id'),
      route: page.getString('route'),
      title: page.getString('title'),
      message: page.getString('message'),
      imageUrl:
        page.getOptionalString('imageUrl') ?? undefined,
      emptyStateImageUrl:
        page.getOptionalString('emptyStateImageUrl') ??
        undefined,
      emptyStateTitle:
        page.getOptionalString('emptyStateTitle') ??
        undefined,
      emptyStateMessage:
        page.getOptionalString('emptyStateMessage') ??
        undefined,
      ctaLabel:
        page.getOptionalString('ctaLabel') ?? undefined,
      ctaHref:
        page.getOptionalString('ctaHref') ?? undefined,
      activeFrom: page.getString('activeFrom'),
      activeTo: page.getString('activeTo'),
    }));
  } catch {
    // Config section missing or invalid
  }

  return result;
}

export interface ActivePageBanners {
  pageBanner: PageBannerConfig | null;
  globalBanner: GlobalBannerConfig | null;
  dismissPageBanner: (id: string) => void;
  dismissGlobalBanner: (id: string) => void;
}

export function usePageBanners(): ActivePageBanners {
  const configApi = useApi(configApiRef);

  const [dismissedIds, setDismissedIds] = useState<Set<string>>(
    new Set(),
  );

  const [pathname, setPathname] = useState(
    () => window.location.pathname,
  );

  useEffect(() => {
    const onNav = () => {
      setPathname(window.location.pathname);
    };

    window.addEventListener('popstate', onNav);

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (
      data: any,
      unused: string,
      url?: string | URL | null,
    ) {
      originalPushState.call(this, data, unused, url);
      onNav();
    };

    window.history.replaceState = function (
      data: any,
      unused: string,
      url?: string | URL | null,
    ) {
      originalReplaceState.call(this, data, unused, url);
      onNav();
    };

    return () => {
      window.removeEventListener('popstate', onNav);

      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (
        event.key?.startsWith('backstage.pagebanner.')
      ) {
        setDismissedIds(new Set());
      }
    };

    window.addEventListener('storage', handler);

    return () => {
      window.removeEventListener('storage', handler);
    };
  }, []);

  const dismiss = (id: string) => {
    dismissPageBanner(id);

    setDismissedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const {
    global: globalConfig,
    pages,
  } = readPageBannersFromConfig(configApi);
  
  const matchedBanner =
    pages
      .filter(page => pathname.startsWith(page.route))
      .sort(
        (a, b) => b.route.length - a.route.length,
      )[0] ?? null;

  const pageBanner =
    matchedBanner &&
    isActive(
      matchedBanner.activeFrom,
      matchedBanner.activeTo,
    ) &&
    !isDismissed(matchedBanner.id) &&
    !dismissedIds.has(matchedBanner.id)
      ? matchedBanner
      : null;

  const globalBanner =
    globalConfig &&
    isActive(
      globalConfig.activeFrom,
      globalConfig.activeTo,
    ) &&
    !isDismissed(globalConfig.id) &&
    !dismissedIds.has(globalConfig.id)
      ? globalConfig
      : null;

      // Temporarily add to usePageBanners, after readPageBannersFromConfig:
console.log('raw config:', { globalConfig, pages });
console.log('pathname:', pathname);
console.log('matchedBanner:', matchedBanner);
console.log('isActive:', matchedBanner && isActive(matchedBanner.activeFrom, matchedBanner.activeTo));
  return {
    pageBanner,
    globalBanner,
    dismissPageBanner: dismiss,
    dismissGlobalBanner: dismiss,
  };
}
