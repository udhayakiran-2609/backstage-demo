export interface GlobalBannerConfig {
  id: string;
  title: string;
  message: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaHref?: string;
  activeFrom: string;
  activeTo: string;
}

export interface PageBannerConfig {
  id: string;
  /** One or more route prefixes this banner matches — e.g. ["/catalog", "/"] */
  routes: string[];
  title: string;
  message: string;
  imageUrl?: string;
  emptyStateImageUrl?: string;
  emptyStateTitle?: string;
  emptyStateMessage?: string;
  ctaLabel?: string;
  ctaHref?: string;
  activeFrom: string;
  activeTo: string;
}

export interface BannerConfig {
  global?: GlobalBannerConfig;
  pages: PageBannerConfig[];
}