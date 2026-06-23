import React, { createContext, useContext } from 'react';
import { PageBannerConfig } from '../components/PageBanner/pageBannerTypes';

interface PageBannerContextValue {
  pageBanner: PageBannerConfig | null;
  dismissPageBanner: (id: string) => void;
}

export const PageBannerContext = createContext<PageBannerContextValue>({
  pageBanner: null,
  dismissPageBanner: () => {},
});

export function usePageBannerContext() {
  return useContext(PageBannerContext);
}
