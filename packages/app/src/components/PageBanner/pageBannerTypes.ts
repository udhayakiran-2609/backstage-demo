export interface PageBannerConfig {
  id: string;
  /** Route prefix this banner matches — e.g. "/catalog", "/docs" */
  route: string;
  title: string;
  message: string;
  /** Full-width image shown as section banner below the page header */
  imageUrl?: string;
  /** Tall image shown inside the empty-state area */
  emptyStateImageUrl?: string;
  emptyStateTitle?: string;
  emptyStateMessage?: string;
  ctaLabel?: string;
  ctaHref?: string;
  activeFrom: string;
  activeTo: string;
}

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