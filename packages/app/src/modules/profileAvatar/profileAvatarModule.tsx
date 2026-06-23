import React, { useState, useEffect, useRef } from 'react';
import {
  createFrontendModule,
  AppRootElementBlueprint,
} from '@backstage/frontend-plugin-api';
import { useApi, identityApiRef } from '@backstage/core-plugin-api';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Popper from '@material-ui/core/Popper';
import Paper from '@material-ui/core/Paper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fade from '@material-ui/core/Fade';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

// ─── Styles ────────────────────────────────────────────────────────────────────

const useStyles = makeStyles(theme => ({
  avatarWrapper: {
    position: 'fixed',
    top: 8,
    right: 16,
    zIndex: 1400,
    display: 'flex',
    alignItems: 'center',
  },

  avatarButton: {
    cursor: 'pointer',
    borderRadius: '50%',
    padding: 0,
    border: 'none',
    background: 'none',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:focus-visible $avatar': {
      boxShadow: `0 0 0 3px ${theme.palette.primary.main}`,
    },
  },

  avatar: {
    width: 36,
    height: 36,
    fontSize: '0.95rem',
    fontWeight: 600,
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark ?? theme.palette.primary.main} 100%)`,
    color: theme.palette.primary.contrastText,
    cursor: 'pointer',
    transition: 'box-shadow 0.18s ease, transform 0.18s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
    '&:hover': {
      boxShadow: `0 0 0 3px ${theme.palette.primary.light}, 0 4px 14px rgba(0,0,0,0.22)`,
      transform: 'scale(1.07)',
    },
  },

  popper: {
    zIndex: 1500,
    marginTop: 8,
  },

  paper: {
    width: 256,
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)',
    border: `1px solid ${theme.palette.divider}`,
  },

  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(2.5, 2, 2),
    background:
      theme.palette.type === 'dark'
        ? 'rgba(255,255,255,0.04)'
        : 'rgba(0,0,0,0.02)',
  },

  headerAvatar: {
    width: 52,
    height: 52,
    fontSize: '1.25rem',
    fontWeight: 700,
    marginBottom: theme.spacing(1),
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark ?? theme.palette.primary.main} 100%)`,
    color: theme.palette.primary.contrastText,
    boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
  },

  displayName: {
    fontWeight: 600,
    fontSize: '0.95rem',
    lineHeight: 1.3,
    textAlign: 'center',
    color: theme.palette.text.primary,
    marginBottom: 2,
  },

  email: {
    fontSize: '0.78rem',
    color: theme.palette.text.secondary,
    textAlign: 'center',
    wordBreak: 'break-all',
    lineHeight: 1.4,
  },

  actions: {
    padding: theme.spacing(1),
  },

  logoutButton: {
    width: '100%',
    justifyContent: 'flex-start',
    borderRadius: 8,
    padding: theme.spacing(0.9, 1.5),
    color: theme.palette.error.main,
    fontWeight: 500,
    fontSize: '0.88rem',
    textTransform: 'none',
    transition: 'background 0.15s ease',
    '&:hover': {
      background:
        theme.palette.type === 'dark'
          ? 'rgba(244,67,54,0.12)'
          : 'rgba(244,67,54,0.08)',
    },
  },

  logoutIcon: {
    marginRight: theme.spacing(1),
    fontSize: '1.1rem',
  },

  loadingWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(3),
  },
}));

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?';
  return (
    (parts[0][0]?.toUpperCase() ?? '') +
    (parts[parts.length - 1][0]?.toUpperCase() ?? '')
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

function ProfileAvatar() {
  const classes = useStyles();
  const identityApi = useApi(identityApiRef);

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [profile, setProfile] = useState<{
    displayName: string;
    email?: string;
    picture?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Check auth state first, then fetch profile
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const identity = await identityApi.getBackstageIdentity();
        // Guest / anonymous users have type 'guest' — not signed in
        if (!identity || identity.type === 'guest') {
          if (!cancelled) setLoading(false);
          return;
        }
        if (!cancelled) setIsAuthenticated(true);

        const info = await identityApi.getProfileInfo();
        if (!cancelled) {
          setProfile({
            displayName: info.displayName ?? 'Unknown User',
            email: info.email,
            picture: info.picture,
          });
          setLoading(false);
        }
      } catch {
        // Not authenticated — stay hidden
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [identityApi]);

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(prev => !prev);
  };

  const handleClose = () => setOpen(false);

  const handleLogout = async () => {
    handleClose();
    await identityApi.signOut();
  };

  const initials = profile ? getInitials(profile.displayName) : '?';

  // Don't render anything until auth is confirmed
  if (!isAuthenticated) return null;

  return (
    <div className={classes.avatarWrapper}>
      {/* Trigger button */}
      <button
        ref={buttonRef}
        className={classes.avatarButton}
        onClick={handleToggle}
        aria-label="Open profile menu"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {loading ? (
          <Avatar className={classes.avatar}>
            <CircularProgress size={18} color="inherit" />
          </Avatar>
        ) : profile?.picture ? (
          <Avatar
            className={classes.avatar}
            src={profile.picture}
            alt={profile.displayName}
          />
        ) : (
          <Avatar className={classes.avatar}>{initials}</Avatar>
        )}
      </button>

      {/* Dropdown */}
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom-end"
        className={classes.popper}
        transition
        disablePortal={false}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={160}>
            <div>
              <ClickAwayListener onClickAway={handleClose}>
                <Paper className={classes.paper} elevation={0}>
                  {/* Profile header */}
                  <div className={classes.header}>
                    {profile?.picture ? (
                      <Avatar
                        className={classes.headerAvatar}
                        src={profile.picture}
                        alt={profile.displayName}
                      />
                    ) : (
                      <Avatar className={classes.headerAvatar}>
                        {loading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          initials
                        )}
                      </Avatar>
                    )}

                    {profile && (
                      <>
                        <Typography className={classes.displayName}>
                          {profile.displayName}
                        </Typography>
                        {profile.email && (
                          <Typography className={classes.email}>
                            {profile.email}
                          </Typography>
                        )}
                      </>
                    )}
                  </div>

                  <Divider />

                  {/* Actions */}
                  <div className={classes.actions}>
                    <Button
                      className={classes.logoutButton}
                      onClick={handleLogout}
                      disableRipple={false}
                    >
                      <ExitToAppIcon className={classes.logoutIcon} />
                      Sign out
                    </Button>
                  </div>
                </Paper>
              </ClickAwayListener>
            </div>
          </Fade>
        )}
      </Popper>
    </div>
  );
}

// ─── Module ────────────────────────────────────────────────────────────────────

const profileAvatarElement = AppRootElementBlueprint.make({
  name: 'profile-avatar',
  params: {
    element: <ProfileAvatar />,
  },
});

export const profileAvatarModule = createFrontendModule({
  pluginId: 'app',
  extensions: [profileAvatarElement],
});
