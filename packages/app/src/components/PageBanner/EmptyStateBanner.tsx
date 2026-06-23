import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { usePageBannerContext } from '../../context/PageBannerContext';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    borderRadius: theme.shape.borderRadius * 2,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 360,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
  image: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    filter: 'brightness(0.55)',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    padding: theme.spacing(4, 6),
    maxWidth: 520,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(1.5),
  },
  title: {
    color: '#fff',
    fontWeight: 700,
    fontSize: '1.5rem',
    textShadow: '0 2px 8px rgba(0,0,0,0.6)',
  },
  message: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: '0.95rem',
    lineHeight: 1.6,
  },
  ctaBtn: {
    marginTop: theme.spacing(1),
    background: '#fff',
    color: theme.palette.primary.main,
    fontWeight: 600,
    fontSize: '0.875rem',
    padding: '8px 24px',
    borderRadius: 8,
    '&:hover': {
      background: 'rgba(255,255,255,0.88)',
    },
  },
  // Fallback when no emptyStateImageUrl provided
  fallback: {
    background: 'linear-gradient(135deg, #1a1040 0%, #0d1f3c 100%)',
    minHeight: 280,
  },
}));

/**
 * Drop this wherever Backstage renders its built-in empty-state UI.
 * It reads the active page banner from context — no props needed.
 *
 * Usage in a custom page or wrapper:
 *   <EmptyStateBanner />
 */
export function EmptyStateBanner() {
  const classes = useStyles();
  const { pageBanner } = usePageBannerContext();

  // Only render when the current page has empty-state config
  if (!pageBanner?.emptyStateImageUrl && !pageBanner?.emptyStateTitle) {
    return null;
  }

  const hasImage = !!pageBanner.emptyStateImageUrl;

  return (
    <div className={`${classes.root} ${!hasImage ? classes.fallback : ''}`}>
      {hasImage && (
        <img
          src={pageBanner.emptyStateImageUrl}
          alt=""
          aria-hidden="true"
          className={classes.image}
        />
      )}
      <div className={classes.overlay} />

      <div className={classes.content}>
        {pageBanner.emptyStateTitle && (
          <Typography className={classes.title}>
            {pageBanner.emptyStateTitle}
          </Typography>
        )}
        {pageBanner.emptyStateMessage && (
          <Typography className={classes.message}>
            {pageBanner.emptyStateMessage}
          </Typography>
        )}
        {pageBanner.ctaLabel && pageBanner.ctaHref && (
          <Button
            component="a"
            href={pageBanner.ctaHref}
            className={classes.ctaBtn}
            size="small"
          >
            {pageBanner.ctaLabel} →
          </Button>
        )}
      </div>
    </div>
  );
}
