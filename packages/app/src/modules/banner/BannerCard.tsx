import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles(theme => ({
  root: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    borderRadius: theme.shape.borderRadius * 2,
    display: 'flex',
    alignItems: 'flex-end',
    background: 'linear-gradient(135deg, #1a1040 0%, #0d1f3c 100%)',
  },

  // ── Sizing variants ──────────────────────────────────────────────────────
  sizeGlobal: { minHeight: 120 },
  sizePage: { minHeight: 200 },
  sizeEmptyState: { minHeight: 320, alignItems: 'center', justifyContent: 'center' },

  image: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
  },

  // Global: right-to-left gradient so text on left stays readable
  overlayGlobal: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(to right, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.50) 55%, rgba(0,0,0,0.10) 100%)',
  },

  // Page banner: bottom-to-top gradient
  overlayPage: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.10) 100%)',
  },

  // Empty state: radial dark centre
  overlayEmptyState: {
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(ellipse at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.65) 100%)',
  },

  content: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.75),
  },
  contentGlobal: {
    padding: theme.spacing(2.5, 5, 2.5, 3),
    maxWidth: 600,
  },
  contentPage: {
    padding: theme.spacing(3, 5, 3, 3),
    maxWidth: 600,
  },
  contentEmptyState: {
    padding: theme.spacing(4, 6),
    maxWidth: 520,
    alignItems: 'center',
    textAlign: 'center',
  },

  title: {
    color: '#fff',
    fontWeight: 700,
    textShadow: '0 1px 4px rgba(0,0,0,0.55)',
  },
  titleGlobal: { fontSize: '1rem', lineHeight: 1.3 },
  titlePage: { fontSize: '1.25rem', lineHeight: 1.3 },
  titleEmptyState: { fontSize: '1.5rem', lineHeight: 1.2 },

  message: {
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 1.55,
  },
  messageGlobal: { fontSize: '0.8rem' },
  messagePage: { fontSize: '0.875rem' },
  messageEmptyState: { fontSize: '0.95rem' },

  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(0.5),
  },

  ctaBtn: {
    background: '#fff',
    color: theme.palette.primary.main,
    fontWeight: 700,
    borderRadius: 8,
    '&:hover': { background: 'rgba(255,255,255,0.88)' },
  },
  ctaBtnGlobal: { fontSize: '0.75rem', padding: '4px 14px' },
  ctaBtnPage: { fontSize: '0.8rem', padding: '6px 18px' },
  ctaBtnEmptyState: { fontSize: '0.875rem', padding: '8px 24px' },

  closeBtn: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    zIndex: 2,
    color: 'rgba(255,255,255,0.75)',
    background: 'rgba(0,0,0,0.30)',
    padding: 4,
    '&:hover': { color: '#fff', background: 'rgba(0,0,0,0.55)' },
  },
}));

export type BannerVariant = 'global' | 'page' | 'emptyState';

interface BannerCardProps {
  variant: BannerVariant;
  title: string;
  message: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaHref?: string;
  onDismiss?: () => void;
}

export function BannerCard({
  variant,
  title,
  message,
  imageUrl,
  ctaLabel,
  ctaHref,
  onDismiss,
}: BannerCardProps) {
  const classes = useStyles();

  const sizeClass = {
    global: classes.sizeGlobal,
    page: classes.sizePage,
    emptyState: classes.sizeEmptyState,
  }[variant];

  const overlayClass = {
    global: classes.overlayGlobal,
    page: classes.overlayPage,
    emptyState: classes.overlayEmptyState,
  }[variant];

  const contentClass = {
    global: classes.contentGlobal,
    page: classes.contentPage,
    emptyState: classes.contentEmptyState,
  }[variant];

  const titleClass = {
    global: classes.titleGlobal,
    page: classes.titlePage,
    emptyState: classes.titleEmptyState,
  }[variant];

  const messageClass = {
    global: classes.messageGlobal,
    page: classes.messagePage,
    emptyState: classes.messageEmptyState,
  }[variant];

  const ctaClass = {
    global: classes.ctaBtnGlobal,
    page: classes.ctaBtnPage,
    emptyState: classes.ctaBtnEmptyState,
  }[variant];

  return (
    <div className={`${classes.root} ${sizeClass}`}>
      {imageUrl && (
        <img src={imageUrl} alt="" aria-hidden="true" className={classes.image} />
      )}
      <div className={overlayClass} />

      <div className={`${classes.content} ${contentClass}`}>
        <Typography className={`${classes.title} ${titleClass}`}>{title}</Typography>
        <Typography className={`${classes.message} ${messageClass}`}>{message}</Typography>

        {ctaLabel && ctaHref && (
          <div className={classes.actions}>
            <Button
              component="a"
              href={ctaHref}
              size="small"
              className={`${classes.ctaBtn} ${ctaClass}`}
            >
              {ctaLabel} →
            </Button>
          </div>
        )}
      </div>

      {onDismiss && (
        <IconButton
          size="small"
          aria-label="Dismiss banner"
          className={classes.closeBtn}
          onClick={onDismiss}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    </div>
  );
}
