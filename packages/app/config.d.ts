// packages/app/config.d.ts
export interface Config {
  pageBanners?: {
    global?: {
      id: string;
      title: string;
      message: string;
      imageUrl?: string;
      ctaLabel?: string;
      ctaHref?: string;
      activeFrom: string;
      activeTo: string;
    };
    pages?: Array<{
      id: string;
      route: string;
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
    }>;
  };
}