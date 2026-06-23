import React, { ReactNode, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useBanners } from './useBanners';
import { useEmptyStateDetector } from './useEmptyStateDetector';
import { BannerCard } from './BannerCard';
import { BannerContext } from './BannerContext';
import { useApi, identityApiRef } from '@backstage/core-plugin-api';

const useStyles = makeStyles(theme => ({
  emptyStateArea: {
    padding: theme.spacing(2, 3, 3),
  },
  contentWrapper: {
    position: 'relative',
  },
}));

interface BannerWrapperProps {
  children: ReactNode;
}

/**
 * BannerWrapper is mounted via PluginWrapperBlueprint — it wraps each
 * plugin's content area individually.
 *
 * Rules:
 *  - Only renders when user is signed in (identityApi returns a profile)
 *  - Does NOT render the global banner here (that lives in AppBannerProvider
 *    to avoid duplicating it across multiple plugins on one page)
 *  - Renders an empty-state banner ONLY when the page content area is empty
 */
export function BannerWrapper({ children }: BannerWrapperProps) {
  const classes = useStyles();
  const banners = useBanners();
  const { pageBanner } = banners;
  const identityApi = useApi(identityApiRef);

  // useApi is synchronous; check if a profile token exists to gate on login
  const [isSignedIn, setIsSignedIn] = React.useState(false);

  React.useEffect(() => {
    identityApi
      .getProfileInfo()
      .then(profile => {
        // If we get a profile (even a guest one with no email), user is in
        setIsSignedIn(!!profile);
      })
      .catch(() => {
        setIsSignedIn(false);
      });
  }, [identityApi]);

  const contentRef = useRef<HTMLDivElement>(null);
  const isEmpty = useEmptyStateDetector(contentRef);

  const hasEmptyStateBanner =
    isSignedIn &&
    isEmpty &&
    pageBanner !== null &&
    (!!pageBanner.emptyStateImageUrl || !!pageBanner.emptyStateTitle);

  return (
    <BannerContext.Provider value={banners}>
      <div ref={contentRef} className={classes.contentWrapper}>
        {children}

        {/* Empty-state banner — only shown when page content is empty AND user is signed in */}
        {hasEmptyStateBanner && (
          <div className={classes.emptyStateArea}>
            <BannerCard
              variant="emptyState"
              title={pageBanner!.emptyStateTitle ?? pageBanner!.title}
              message={pageBanner!.emptyStateMessage ?? pageBanner!.message}
              imageUrl={pageBanner!.emptyStateImageUrl}
              ctaLabel={pageBanner!.ctaLabel}
              ctaHref={pageBanner!.ctaHref}
            />
          </div>
        )}
      </div>
    </BannerContext.Provider>
  );
}
