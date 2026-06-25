import  { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useApi, identityApiRef } from '@backstage/core-plugin-api';
import { useBanners } from './useBanners';
import { BannerCard } from './BannerCard';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(1.5, 3, 0),
  },
}));

/**
 * GlobalBannerBar renders the single global banner once at the app level.
 *
 * Mount this in App.tsx inside your layout, ABOVE the plugin content area
 * but BELOW the sidebar/header — e.g. inside your existing AppLayout or
 * directly in the router children.
 *
 * It is intentionally separate from BannerWrapper (which runs per-plugin)
 * so the global banner appears exactly once per page, not once per plugin.
 *
 * Only shown after the user is signed in.
 */
export function GlobalBannerBar() {
  const classes = useStyles();
  const { globalBanner, dismissGlobal } = useBanners();
  const identityApi = useApi(identityApiRef);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    identityApi
      .getProfileInfo()
      .then(profile => setIsSignedIn(!!profile))
      .catch(() => setIsSignedIn(false));
  }, [identityApi]);

  if (!isSignedIn || !globalBanner) return null;

  return (
    <div className={classes.root}>
      <BannerCard
        variant="global"
        title={globalBanner.title}
        message={globalBanner.message}
        imageUrl={globalBanner.imageUrl}
        ctaLabel={globalBanner.ctaLabel}
        ctaHref={globalBanner.ctaHref}
        onDismiss={dismissGlobal}
      />
    </div>
  );
}
