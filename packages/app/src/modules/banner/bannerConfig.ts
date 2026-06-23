export type BannerVariant = 'info' | 'success' | 'warning' | 'release';

export interface BannerConfig {
  id: string;
  title: string;
  message: string;
  variant: BannerVariant;
  activeFrom: string;
  activeTo: string;
  ctaLabel?: string;
  ctaHref?: string;
  badge?: string;
}

export const banners: BannerConfig[] = [
  {
    id: 'platform-v3-release',
    title: 'Platform v3 is live!',
    message:
      'New developer portal with faster search, redesigned service pages, and one-click scaffolding.',
    variant: 'release',
    activeFrom: '2025-01-01',  
    activeTo: '2026-12-31',
    ctaLabel: 'See what\'s new',
    ctaHref: '/docs/default/component/platform-v3-changelog',
    badge: '🚀',
  },
  {
    id: 'scheduled-maintenance-jul',
    title: 'Scheduled maintenance',
    message:
      'The internal CI/CD cluster will be offline 02:00 – 05:00 UTC on July 20.',
    variant: 'warning',
    activeFrom: '2025-01-01',
    activeTo: '2026-07-20',
    ctaLabel: 'Read the runbook',
    ctaHref: '/docs/default/component/maintenance-jul-2026',
    badge: '⚠️',
  },
  {
    id: 'scheduled-maintenance-jul1',
    title: 'Scheduled maintenance',
    message:
      'The internal CI/CD cluster will be offline 02:00 – 05:00 UTC on July 20.',
    variant: 'info',
    activeFrom: '2025-01-01',
    activeTo: '2026-07-20',
    ctaLabel: 'Read the runbook',
    ctaHref: '/docs/default/component/maintenance-jul-2026',
    badge: 'ℹ️',
  },
  {
    id: 'scheduled-maintenance-jul2',
    title: 'Scheduled maintenance',
    message:
      'The internal CI/CD cluster will be offline 02:00 – 05:00 UTC on July 20.',
    variant: 'success',
    activeFrom: '2025-01-01',
    activeTo: '2026-07-20',
    ctaLabel: 'Read the runbook',
    ctaHref: '/docs/default/component/maintenance-jul-2026',
    badge: '✅',
  },
  {
    id: 'scheduled-maintenance-jul3',
    title: 'Scheduled maintenance',
    message:
      'The internal CI/CD cluster will be offline 02:00 – 05:00 UTC on July 20.',
    variant: 'warning',
    activeFrom: '2026-07-10',
    activeTo: '2026-07-20',
    ctaLabel: 'Read the runbook',
    ctaHref: '/docs/default/component/maintenance-jul-2026',
    badge: '⚠️',
  },
];