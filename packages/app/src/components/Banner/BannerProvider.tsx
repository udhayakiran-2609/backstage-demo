import React, { useState, useCallback } from 'react';
import { useActiveBanners } from '../../modules/banner/useActiveBanners';
import { BannerStrip } from './BannerStrip';

export function BannerProvider() {
  const { activeBanners, dismiss } = useActiveBanners();
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

  if (activeBanners.length === 0) return null;

  return (
    <div style={{ position: 'relative', zIndex: 1300 }}>
      <BannerStrip
        key={activeBanners[safeIndex].id}
        banner={activeBanners[safeIndex]}
        onDismiss={handleDismiss}
        // Carousel controls — only shown when >1 banner
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