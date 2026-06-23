import React, { ReactNode, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { usePageBanners } from '../../hooks/usePageBanners';
import { useEmptyStateDetector } from '../../hooks/useEmptyStateDetector';
import { PageImageBanner } from './pageImageBanner';
import { EmptyStateBanner } from './EmptyStateBanner';
import { PageBannerContext } from '../../context/PageBannerContext';

const useStyles = makeStyles(theme => ({
  bannerArea: {
    padding: theme.spacing(2, 3, 0),
  },
  contentWrapper: {
    position: 'relative',
  },
  emptyStateOverlay: {
    padding: theme.spacing(0, 3, 3),
  },
}));

interface PageBannerWrapperProps {
  children: ReactNode;
}

/**
 * Wraps every plugin page via PluginWrapperBlueprint.
 *
 * Responsibilities:
 *  1. Read active banners for the current route from app-config via usePageBanners()
 *  2. Render a PageImageBanner (section banner with image) below the page header
 *  3. Detect when the page content renders an empty state (via MutationObserver)
 *     and inject an EmptyStateBanner image card in the empty area
 *  4. Expose PageBannerContext for any component deeper in the tree
 */
export function PageBannerWrapper({ children }: PageBannerWrapperProps) {
  const classes = useStyles();
  const { pageBanner, dismissPageBanner } = usePageBanners();
  console.log('pageBanner:', pageBanner, 'pathname:', window.location.pathname);
  const contentRef = useRef<HTMLDivElement>(null);
  const isEmpty = useEmptyStateDetector(contentRef);

  const hasEmptyStateBanner =
    isEmpty &&
    pageBanner !== null &&
    (!!pageBanner.emptyStateImageUrl || !!pageBanner.emptyStateTitle);

  return (
    <PageBannerContext.Provider value={{ pageBanner, dismissPageBanner }}>
      {/* Section banner: full-width image below the page header */}
      {pageBanner?.imageUrl && (
        <div className={classes.bannerArea}>
          <PageImageBanner banner={pageBanner} onDismiss={dismissPageBanner} />
        </div>
      )}

      {/* Page content — plugins render here */}
      <div ref={contentRef} className={classes.contentWrapper}>
        {children}

        {/* Empty-state banner: injected below the detected empty content */}
        {hasEmptyStateBanner && (
          <div className={classes.emptyStateOverlay}>
            <EmptyStateBanner />
          </div>
        )}
      </div>
    </PageBannerContext.Provider>
  );
}
