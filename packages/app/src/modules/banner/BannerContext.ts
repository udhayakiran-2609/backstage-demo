import { createContext, useContext } from 'react';
import { ActiveBanners } from './useBanners';

const defaultValue: ActiveBanners = {
  globalBanner: null,
  pageBanner: null,
  dismissGlobal: () => {},
  dismissPage: () => {},
};

export const BannerContext = createContext<ActiveBanners>(defaultValue);

export function useBannerContext(): ActiveBanners {
  return useContext(BannerContext);
}