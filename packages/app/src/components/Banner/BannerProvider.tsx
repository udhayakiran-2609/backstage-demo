import  { useState, useCallback } from 'react';
import { useActiveBanners } from '@internal/plugin-banner-admin';
import { BannerStrip } from './BannerStrip';

/**
 * Reads live banners from the backend database via useActiveBanners().
 * Supports carousel navigation when multiple banners are active.
 * Rendered via AppRootElementBlueprint — mounts above every page.
 */
export function BannerProvider() {
  const { activeBanners, dismiss, loading } = useActiveBanners();
  const [currentIndex, setCurrentIndex] = useState(0);

  const safeIndex = Math.min(currentIndex, Math.max(activeBanners.length - 1, 0));

  const handlePrev = useCallback(() => {
    setCurrentIndex(i => Math.max(i - 1, 0));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex(i => Math.min(i + 1, activeBanners.length - 1));
  }, [activeBanners.length]);

  const handleDismiss = useCallback((id: string) => {
    dismiss(id);
    setCurrentIndex(i => Math.max(Math.min(i, activeBanners.length - 2), 0));
  }, [dismiss, activeBanners.length]);

  if (loading || activeBanners.length === 0) return null;

  const banner = activeBanners[safeIndex];

  return (
    <div style={{ width: '100%', position: 'relative', zIndex: 99999999 }}>
      <BannerStrip
        key={banner.id}
        banner={banner}
        onDismiss={handleDismiss}
        showPrev={safeIndex > 0}
        showNext={safeIndex < activeBanners.length - 1}
        onPrev={handlePrev}
        onNext={handleNext}
        currentIndex={safeIndex}
        totalCount={activeBanners.length}
      />
    </div>
  );
}
