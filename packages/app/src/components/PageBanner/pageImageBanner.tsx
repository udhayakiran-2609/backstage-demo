;
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { PageBannerConfig, GlobalBannerConfig } from './pageBannerTypes';

const useStyles = makeStyles(theme => ({
  root: {
    position: 'relative',
    width: '100%',
    minHeight: 180,
    overflow: 'hidden',
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(3),
    display: 'flex',
    alignItems: 'flex-end',
    cursor: 'default',
  },
  image: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
  },
  // Dark gradient overlay so text stays readable over any image
  overlay: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.15) 100%)',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    padding: theme.spacing(3, 4),
    maxWidth: 640,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  title: {
    color: '#fff',
    fontWeight: 700,
    fontSize: '1.25rem',
    lineHeight: 1.3,
    textShadow: '0 1px 3px rgba(0,0,0,0.5)',
  },
  message: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(0.5),
  },
  ctaBtn: {
    background: '#fff',
    color: theme.palette.primary.main,
    fontWeight: 600,
    fontSize: '0.8rem',
    padding: '6px 18px',
    borderRadius: 6,
    '&:hover': {
      background: 'rgba(255,255,255,0.88)',
    },
  },
  closeBtn: {
    position: 'absolute',
    top: theme.spacing(1.5),
    right: theme.spacing(1.5),
    zIndex: 2,
    color: 'rgba(255,255,255,0.7)',
    background: 'rgba(0,0,0,0.3)',
    padding: 4,
    '&:hover': {
      color: '#fff',
      background: 'rgba(0,0,0,0.55)',
    },
  },
  // Fallback background when no image provided
  fallback: {
    background: 'linear-gradient(135deg, #1a1040 0%, #0f2d4a 100%)',
  },
}));

interface PageImageBannerProps {
  banner: PageBannerConfig | GlobalBannerConfig;
  onDismiss: (id: string) => void;
}

export function PageImageBanner({ banner, onDismiss }: PageImageBannerProps) {
  const classes = useStyles();
  const hasImage = !!banner.imageUrl;

  return (
    <div className={`${classes.root} ${!hasImage ? classes.fallback : ''}`}>
      {hasImage && (
        <img
          src={banner.imageUrl}
          alt=""
          aria-hidden="true"
          className={classes.image}
        />
      )}
      <div className={classes.overlay} />

      <div className={classes.content}>
        <Typography className={classes.title}>{banner.title}</Typography>
        <Typography className={classes.message}>{banner.message}</Typography>

        {banner.ctaLabel && banner.ctaHref && (
          <div className={classes.actions}>
            <Button
              component="a"
              href={banner.ctaHref}
              className={classes.ctaBtn}
              size="small"
            >
              {banner.ctaLabel} →
            </Button>
          </div>
        )}
      </div>

      <IconButton
        size="small"
        aria-label="Dismiss banner"
        className={classes.closeBtn}
        onClick={() => onDismiss(banner.id)}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </div>
  );
}
