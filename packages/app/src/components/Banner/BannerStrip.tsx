import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
// ↓ Use the API Banner type from the plugin — NOT the static BannerConfig
// import { Banner } from './../../plugins/banners-admin/src/api/BannersClient';

import { Banner } from '@internal/plugin-banner-admin';


type BannerVariant = Banner['variant']; // 'release' | 'info' | 'success' | 'warning'

// ── Palette ────────────────────────────────────────────────────────────────
const VARIANT_STYLES: Record<
  BannerVariant,
  { bg: string; text: string; accent: string; border: string }
> = {
  release: {
    bg: 'linear-gradient(90deg, #0d0d1a 0%, #1a1040 50%, #0d0d1a 100%)',
    text: '#e8e0ff',
    accent: '#a78bfa',
    border: '#4c1d95',
  },
  info: {
    bg: 'linear-gradient(90deg, #0c1a2e 0%, #0f2d4a 50%, #0c1a2e 100%)',
    text: '#bde0ff',
    accent: '#60a5fa',
    border: '#1e3a5f',
  },
  success: {
    bg: 'linear-gradient(90deg, #052e16 0%, #0a3d22 50%, #052e16 100%)',
    text: '#bbf7d0',
    accent: '#34d399',
    border: '#065f46',
  },
  warning: {
    bg: 'linear-gradient(90deg, #1c0a00 0%, #2d1200 50%, #1c0a00 100%)',
    text: '#fed7aa',
    accent: '#fb923c',
    border: '#7c2d12',
  },
};

// ── Styles ─────────────────────────────────────────────────────────────────
const useStyles = makeStyles({
  root: (props: { variant: BannerVariant }) => {
    const s = VARIANT_STYLES[props.variant];
    return {
      background: s.bg,
      borderBottom: `1px solid ${s.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '8px',
      padding: '10px 16px 10px 24px',
      minHeight: 52,
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        background:
          'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)',
        backgroundSize: '200% 100%',
        animation: '$shimmer 4s ease infinite',
        pointerEvents: 'none',
      },
    };
  },
  '@keyframes shimmer': {
    '0%': { backgroundPosition: '200% 0' },
    '100%': { backgroundPosition: '-200% 0' },
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
    minWidth: 0,
    flexWrap: 'wrap' as const,
  },
  badge: { fontSize: '1.15rem', lineHeight: 1, flexShrink: 0 },
  titleChip: (props: { variant: BannerVariant }) => {
    const s = VARIANT_STYLES[props.variant];
    return {
      color: s.accent,
      fontWeight: 700,
      fontSize: '0.78rem',
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as const,
      background: `${s.accent}18`,
      border: `1px solid ${s.accent}40`,
      borderRadius: 4,
      padding: '2px 8px',
      whiteSpace: 'nowrap' as const,
      flexShrink: 0,
    };
  },
  message: (props: { variant: BannerVariant }) => ({
    color: VARIANT_STYLES[props.variant].text,
    fontSize: '0.85rem',
    lineHeight: 1.4,
    opacity: 0.9,
  }),
  actions: { display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 },
  ctaButton: (props: { variant: BannerVariant }) => {
    const s = VARIANT_STYLES[props.variant];
    return {
      color: s.accent,
      borderColor: `${s.accent}60`,
      fontSize: '0.78rem',
      fontWeight: 600,
      letterSpacing: '0.04em',
      padding: '3px 12px',
      minWidth: 'unset',
      whiteSpace: 'nowrap' as const,
      marginRight: 4,
      '&:hover': { background: `${s.accent}18`, borderColor: s.accent },
    };
  },
  navBtn: (props: { variant: BannerVariant }) => ({
    color: VARIANT_STYLES[props.variant].text,
    opacity: 0.6,
    padding: 3,
    '&:hover': { opacity: 1 },
    '&:disabled': { opacity: 0.2 },
  }),
  pagination: (props: { variant: BannerVariant }) => ({
    color: VARIANT_STYLES[props.variant].text,
    fontSize: '0.72rem',
    opacity: 0.55,
    minWidth: 28,
    textAlign: 'center' as const,
    fontVariantNumeric: 'tabular-nums',
    userSelect: 'none' as const,
  }),
  closeBtn: (props: { variant: BannerVariant }) => ({
    color: VARIANT_STYLES[props.variant].text,
    opacity: 0.5,
    padding: 4,
    marginLeft: 2,
    '&:hover': { opacity: 1 },
  }),
  divider: (props: { variant: BannerVariant }) => ({
    width: 1,
    height: 18,
    background: VARIANT_STYLES[props.variant].text,
    opacity: 0.15,
    margin: '0 4px',
    flexShrink: 0,
  }),
});

// ── Component ──────────────────────────────────────────────────────────────
interface BannerStripProps {
  banner: Banner;            // ← was BannerConfig, now the API Banner type
  onDismiss: (id: string) => void;
  showPrev?: boolean;
  showNext?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  currentIndex?: number;
  totalCount?: number;
}

export function BannerStrip({
  banner,
  onDismiss,
  showPrev = false,
  showNext = false,
  onPrev,
  onNext,
  currentIndex,
  totalCount,
}: BannerStripProps) {
  const classes = useStyles({ variant: banner.variant });
  const isCarousel = totalCount !== undefined && totalCount > 1;

  return (
    <div className={classes.root} role="status" aria-live="polite">
      <div className={classes.left}>
        {banner.badge && (
          <span className={classes.badge} aria-hidden="true">{banner.badge}</span>
        )}
        <span className={classes.titleChip}>{banner.title}</span>
        <Typography component="span" className={classes.message}>
          {banner.message}
        </Typography>
      </div>

      <div className={classes.actions}>
        {banner.ctaLabel && banner.ctaHref && (
          <Button variant="outlined" size="small" href={banner.ctaHref} className={classes.ctaButton}>
            {banner.ctaLabel} →
          </Button>
        )}

        {isCarousel && (
          <>
            <span className={classes.divider} aria-hidden="true" />
            <IconButton
              size="small"
              aria-label="Previous banner"
              onClick={onPrev}
              disabled={!showPrev}
              className={classes.navBtn}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <span
              className={classes.pagination}
              aria-label={`Banner ${(currentIndex ?? 0) + 1} of ${totalCount}`}
            >
              {(currentIndex ?? 0) + 1}/{totalCount}
            </span>
            <IconButton
              size="small"
              aria-label="Next banner"
              onClick={onNext}
              disabled={!showNext}
              className={classes.navBtn}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
            <span className={classes.divider} aria-hidden="true" />
          </>
        )}

        <IconButton
          size="small"
          aria-label="Dismiss banner"
          onClick={() => onDismiss(banner.id)}
          className={classes.closeBtn}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>
    </div>
  );
}
