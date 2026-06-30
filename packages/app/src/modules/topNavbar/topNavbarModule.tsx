import { useState, useEffect } from 'react';
import {
  createFrontendModule,
  AppRootElementBlueprint,
} from '@backstage/frontend-plugin-api';
import { useApi, identityApiRef } from '@backstage/core-plugin-api';
import { useNavigate } from 'react-router-dom';
import { makeStyles, alpha } from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import Popper from '@material-ui/core/Popper';
import Paper from '@material-ui/core/Paper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Fade from '@material-ui/core/Fade';
import Badge from '@material-ui/core/Badge';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';

import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import TrackChangesIcon from '@material-ui/icons/TrackChanges';
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';
import ClearIcon from '@material-ui/icons/Clear';

// ─── Constants ──────────────────────────────────────────────────────────────────

const NAVBAR_HEIGHT = 48;
const SIDEBAR_WIDTH_DESKTOP = 224;
const SIDEBAR_WIDTH_COLLAPSED = 56; // Backstage collapses sidebar to icons at tablet

// ─── Styles ─────────────────────────────────────────────────────────────────────

const useStyles = makeStyles(theme => {
  const isDark = theme.palette.type === 'dark';
  const navBg = isDark ? '#1a1a2e' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  return {
    // ── Navbar shell ─────────────────────────────────────────────────────────────
    navbar: {
      position: 'fixed',
      top: 0,
      // Offset changes at tablet where sidebar collapses
      left: SIDEBAR_WIDTH_DESKTOP,
      right: 0,
      height: NAVBAR_HEIGHT,
      zIndex: 1300,
      background: navBg,
      borderBottom: `1px solid ${borderColor}`,
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0, 2),
      gap: theme.spacing(1),
      boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
      boxSizing: 'border-box',
      // Tablet: sidebar collapses to icon rail
      [theme.breakpoints.down('md')]: {
        left: SIDEBAR_WIDTH_COLLAPSED,
        padding: theme.spacing(0, 1.5),
        gap: theme.spacing(0.75),
      },
      // Mobile: sidebar is hidden / overlays
      [theme.breakpoints.down('sm')]: {
        left: 0,
        padding: theme.spacing(0, 1),
        gap: theme.spacing(0.5),
      },
    },

    // ── Search trigger (full pill, desktop) ──────────────────────────────────────
    searchTrigger: {
      flex: 1,
      maxWidth: 400,
      minWidth: 0,
      display: 'flex',
      alignItems: 'center',
      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      border: `1px solid ${borderColor}`,
      borderRadius: 6,
      height: 32,
      padding: theme.spacing(0, 1),
      cursor: 'pointer',
      transition: 'border-color 0.15s, background 0.15s',
      userSelect: 'none',
      '&:hover': {
        borderColor: theme.palette.primary.main,
        background: isDark ? 'rgba(255,255,255,0.09)' : '#fff',
      },
      // Tablet: shrink but keep text
      [theme.breakpoints.down('md')]: {
        maxWidth: 280,
      },
      // Mid: icon-only circle button
      [theme.breakpoints.down('xs')]: {
        flex: '0 0 auto',
        maxWidth: 'unset',
        width: 32,
        minWidth: 32,
        padding: 0,
        borderRadius: '50%',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        '&:hover': {
          background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
          borderColor: 'transparent',
        },
      },
    },
    searchIcon: {
      fontSize: '1rem',
      color: theme.palette.text.secondary,
      marginRight: theme.spacing(0.75),
      flexShrink: 0,
      [theme.breakpoints.down('xs')]: {
        marginRight: 0,
        fontSize: '1.15rem',
      },
    },
    searchPlaceholder: {
      fontSize: '0.82rem',
      color: theme.palette.text.hint,
      flex: 1,
      pointerEvents: 'none',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      // Hide text on mobile, show icon only
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    searchKbd: {
      fontSize: '0.68rem',
      color: theme.palette.text.secondary,
      background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)',
      border: `1px solid ${borderColor}`,
      borderRadius: 4,
      padding: '1px 5px',
      fontFamily: 'monospace',
      lineHeight: '18px',
      flexShrink: 0,
      // Hide kbd hint on tablet/mobile — saves space
      [theme.breakpoints.down('md')]: {
        display: 'none',
      },
    },

    spacer: { flex: 1 },

    // ── Create button ─────────────────────────────────────────────────────────────
    createBtn: {
      height: 30,
      borderRadius: 6,
      textTransform: 'none',
      fontSize: '0.82rem',
      fontWeight: 600,
      padding: theme.spacing(0, 1.25),
      minWidth: 0,
      flexShrink: 0,
      color: theme.palette.primary.contrastText,
      background: theme.palette.primary.main,
      '&:hover': { background: theme.palette.primary.dark },
      // Mobile: icon-only circle
      [theme.breakpoints.down('xs')]: {
        width: 30,
        padding: 0,
        borderRadius: '50%',
        minWidth: 30,
      },
    },
    createIcon: {
      fontSize: '1rem',
      marginRight: 2,
      [theme.breakpoints.down('xs')]: { marginRight: 0 },
    },
    createLabel: {
      [theme.breakpoints.down('xs')]: { display: 'none' },
    },
    createArrow: {
      fontSize: '1rem',
      marginLeft: 1,
      opacity: 0.8,
      [theme.breakpoints.down('xs')]: { display: 'none' },
    },

    // ── Shortcut buttons (TechRadar, Docs) ───────────────────────────────────────
    shortcutBtn: {
      height: 30,
      borderRadius: 6,
      textTransform: 'none',
      fontSize: '0.82rem',
      fontWeight: 500,
      padding: theme.spacing(0, 1.25),
      minWidth: 0,
      flexShrink: 0,
      color: theme.palette.text.primary,
      '&:hover': {
        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
      },
      // Hidden on tablet and below — exposed via ⋮ overflow or removed
      [theme.breakpoints.down('md')]: { display: 'none' },
    },
    shortcutIcon: {
      fontSize: '0.95rem',
      marginRight: theme.spacing(0.5),
      color: theme.palette.text.secondary,
    },

    dividerV: {
      width: 1,
      height: 20,
      background: borderColor,
      margin: theme.spacing(0, 0.5),
      flexShrink: 0,
      // Collapse dividers on mobile
      [theme.breakpoints.down('xs')]: { display: 'none' },
    },
    dividerVTablet: {
      width: 1,
      height: 20,
      background: borderColor,
      margin: theme.spacing(0, 0.5),
      flexShrink: 0,
      // Keep dividers on tablet, hide on mobile
      [theme.breakpoints.down('sm')]: { display: 'none' },
    },

    // ── Icon buttons ──────────────────────────────────────────────────────────────
    iconBtn: {
      width: 32,
      height: 32,
      borderRadius: 6,
      flexShrink: 0,
      color: theme.palette.text.secondary,
      '&:hover': {
        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
        color: theme.palette.text.primary,
      },
      // Smaller tap target on mobile
      [theme.breakpoints.down('xs')]: {
        width: 28,
        height: 28,
        borderRadius: '50%',
      },
    },
    iconBtnSvg: {
      fontSize: '1.15rem',
      [theme.breakpoints.down('xs')]: { fontSize: '1rem' },
    },
    // Help hidden on mobile to save space
    helpBtn: {
      [theme.breakpoints.down('xs')]: { display: 'none' },
    },

    // ── Avatar ────────────────────────────────────────────────────────────────────
    avatarBtn: {
      padding: 0,
      borderRadius: '50%',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      outline: 'none',
      flexShrink: 0,
    },
    avatar: {
      width: 30,
      height: 30,
      fontSize: '0.78rem',
      fontWeight: 700,
      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${
        theme.palette.primary.dark ?? theme.palette.primary.main
      })`,
      color: theme.palette.primary.contrastText,
      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      transition: 'box-shadow 0.15s, transform 0.15s',
      '&:hover': {
        boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
        transform: 'scale(1.06)',
      },
      [theme.breakpoints.down('xs')]: {
        width: 26,
        height: 26,
        fontSize: '0.7rem',
      },
    },

    // ── Shared dropdown ───────────────────────────────────────────────────────────
    popper: { zIndex: 1500, marginTop: 6 },
    paper: {
      borderRadius: 10,
      overflow: 'hidden',
      boxShadow: '0 8px 28px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)',
      border: `1px solid ${borderColor}`,
      minWidth: 180,
    },

    // ── Create dropdown ───────────────────────────────────────────────────────────
    createMenuItem: {
      fontSize: '0.84rem',
      padding: theme.spacing(1, 2),
      gap: theme.spacing(1),
      '&:hover': { background: alpha(theme.palette.primary.main, 0.08) },
    },
    createMenuIcon: { fontSize: '1rem', color: theme.palette.primary.main },

    // ── Profile dropdown ──────────────────────────────────────────────────────────
    profileHeader: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: theme.spacing(2, 2, 1.5),
      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    },
    profileAvatar: {
      width: 48,
      height: 48,
      fontSize: '1.1rem',
      fontWeight: 700,
      marginBottom: theme.spacing(1),
      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${
        theme.palette.primary.dark ?? theme.palette.primary.main
      })`,
      color: theme.palette.primary.contrastText,
    },
    profileName: {
      fontWeight: 600,
      fontSize: '0.9rem',
      textAlign: 'center',
      color: theme.palette.text.primary,
      lineHeight: 1.3,
    },
    profileEmail: {
      fontSize: '0.75rem',
      color: theme.palette.text.secondary,
      textAlign: 'center',
      wordBreak: 'break-all',
      marginTop: 2,
    },
    profileActions: { padding: theme.spacing(0.75) },
    profileMenuItem: {
      borderRadius: 7,
      fontSize: '0.84rem',
      gap: theme.spacing(1),
      padding: theme.spacing(0.8, 1.25),
      color: theme.palette.text.primary,
      '&:hover': {
        background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
      },
    },
    profileMenuIcon: { fontSize: '1rem', color: theme.palette.text.secondary },
    logoutItem: {
      borderRadius: 7,
      fontSize: '0.84rem',
      gap: theme.spacing(1),
      padding: theme.spacing(0.8, 1.25),
      color: theme.palette.error.main,
      '&:hover': { background: alpha(theme.palette.error.main, 0.08) },
    },
    logoutIcon: { fontSize: '1rem', color: theme.palette.error.main },

    // ── Search modal ──────────────────────────────────────────────────────────────
    searchDialog: {
      '& .MuiDialog-paper': {
        borderRadius: 12,
        margin: 16,
        // Full-width on mobile
        [theme.breakpoints.down('xs')]: {
          margin: 8,
          width: 'calc(100% - 16px)',
          maxWidth: '100%',
        },
      },
    },
    searchModalInner: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
      padding: theme.spacing(0.5, 1),
      borderBottom: `1px solid ${borderColor}`,
    },
    searchModalIcon: { fontSize: '1.2rem', color: theme.palette.text.secondary, flexShrink: 0 },
    searchModalInput: {
      flex: 1,
      fontSize: '1rem',
      '& input': { padding: theme.spacing(1, 0) },
    },
    searchModalClear: { fontSize: '1rem', color: theme.palette.text.secondary },
    searchModalHint: {
      padding: theme.spacing(2),
      color: theme.palette.text.secondary,
      fontSize: '0.84rem',
      textAlign: 'center',
    },
    searchModalResults: { padding: theme.spacing(1) },
    searchResultItem: {
      borderRadius: 8,
      padding: theme.spacing(1, 1.5),
      cursor: 'pointer',
      '&:hover': {
        background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      },
    },
    searchResultTitle: { fontSize: '0.88rem', fontWeight: 600 },
    searchResultSub: { fontSize: '0.75rem', color: theme.palette.text.secondary },

    // ── Overflow menu (tablet: TechRadar + Docs) ─────────────────────────────────
    overflowBtn: {
      width: 32,
      height: 32,
      borderRadius: 6,
      flexShrink: 0,
      color: theme.palette.text.secondary,
      fontSize: '1.1rem',
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      background: 'none',
      border: 'none',
      padding: 0,
      '&:hover': {
        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
        color: theme.palette.text.primary,
      },
      // Show on tablet, hide on desktop (shortcuts shown inline) and mobile
      [theme.breakpoints.between('sm', 'md')]: {
        display: 'flex',
      },
    },
    overflowMenuItem: {
      fontSize: '0.84rem',
      padding: theme.spacing(0.9, 2),
      gap: theme.spacing(1),
      color: theme.palette.text.primary,
      '&:hover': {
        background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
      },
    },
    overflowMenuIcon: { fontSize: '1rem', color: theme.palette.text.secondary },
  };
});

// ─── Helpers ────────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0][0] ?? '?').toUpperCase();
  return (
    (parts[0][0] ?? '').toUpperCase() +
    (parts[parts.length - 1][0] ?? '').toUpperCase()
  );
}

// ─── Search Modal ────────────────────────────────────────────────────────────────

function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const classes = useStyles();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (open) setQuery('');
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      navigate(`/search?query=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      className={classes.searchDialog}
      aria-label="Search"
    >
      <DialogContent style={{ padding: 0 }}>
        <form onSubmit={submit}>
          <div className={classes.searchModalInner}>
            <SearchIcon className={classes.searchModalIcon} />
            <InputBase
              fullWidth
              className={classes.searchModalInput}
              placeholder="Search for services, docs, people, repositories..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              inputProps={{ 'aria-label': 'search query' }}
            />
            {query && (
              <IconButton size="small" onClick={() => setQuery('')} aria-label="Clear">
                <ClearIcon className={classes.searchModalClear} />
              </IconButton>
            )}
          </div>
        </form>
        {!query && (
          <div className={classes.searchModalHint}>
            Type to search — press <strong>Enter</strong> to see all results
          </div>
        )}
        {query && (
          <div className={classes.searchModalResults}>
            <MenuItem
              className={classes.searchResultItem}
              onClick={() => {
                onClose();
                navigate(`/search?query=${encodeURIComponent(query.trim())}`);
              }}
            >
              <Typography className={classes.searchResultTitle}>
                Search for "{query}"
              </Typography>
              <Typography className={classes.searchResultSub}>
                See all results in the catalog
              </Typography>
            </MenuItem>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Create Menu ─────────────────────────────────────────────────────────────────

function CreateMenu() {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();
  // const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down('xs'));

  const toggle = (e: React.MouseEvent<HTMLElement>) => {
    setAnchor(e.currentTarget);
    setOpen(v => !v);
  };
  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      <Button
        className={classes.createBtn}
        onClick={toggle}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Create"
      >
        <AddIcon className={classes.createIcon} />
        <span className={classes.createLabel}>Create</span>
        <ArrowDropDownIcon className={classes.createArrow} />
      </Button>
      <Popper
        open={open}
        anchorEl={anchor}
        placement="bottom-start"
        className={classes.popper}
        transition
        disablePortal={false}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={140}>
            <div>
              <ClickAwayListener onClickAway={() => setOpen(false)}>
                <Paper className={classes.paper} elevation={0}>
                  <div style={{ padding: 6 }}>
                    <MenuItem
                      className={classes.createMenuItem}
                      onClick={() => go('/catalog-import')}
                    >
                      <AddIcon className={classes.createMenuIcon} />
                      Register existing component
                    </MenuItem>
                    <MenuItem
                      className={classes.createMenuItem}
                      onClick={() => go('/create')}
                    >
                      <AddIcon className={classes.createMenuIcon} />
                      Create new component
                    </MenuItem>
                  </div>
                </Paper>
              </ClickAwayListener>
            </div>
          </Fade>
        )}
      </Popper>
    </>
  );
}

// ─── Overflow Menu (tablet: TechRadar + Docs collapsed) ─────────────────────────

function OverflowMenu() {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchor(e.currentTarget);
    setOpen(v => !v);
  };
  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      <button
        className={classes.overflowBtn}
        onClick={toggle}
        aria-label="More options"
        aria-haspopup="true"
        aria-expanded={open}
      >
        ···
      </button>
      <Popper
        open={open}
        anchorEl={anchor}
        placement="bottom-end"
        className={classes.popper}
        transition
        disablePortal={false}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={140}>
            <div>
              <ClickAwayListener onClickAway={() => setOpen(false)}>
                <Paper className={classes.paper} elevation={0}>
                  <div style={{ padding: 6 }}>
                    <MenuItem
                      className={classes.overflowMenuItem}
                      onClick={() => go('/tech-radar')}
                    >
                      <TrackChangesIcon className={classes.overflowMenuIcon} />
                      TechRadar
                    </MenuItem>
                    <MenuItem
                      className={classes.overflowMenuItem}
                      onClick={() => go('/docs')}
                    >
                      <MenuBookIcon className={classes.overflowMenuIcon} />
                      Docs
                    </MenuItem>
                  </div>
                </Paper>
              </ClickAwayListener>
            </div>
          </Fade>
        )}
      </Popper>
    </>
  );
}

// ─── Profile Menu ────────────────────────────────────────────────────────────────

function ProfileMenu() {
  const classes = useStyles();
  const identityApi = useApi(identityApiRef);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [profile, setProfile] = useState<{
    displayName: string;
    email?: string;
    picture?: string;
  } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const identity = await identityApi.getBackstageIdentity();
        if (!identity) return;
        if (!cancelled) setIsAuthenticated(true);
        const info = await identityApi.getProfileInfo();
        if (!cancelled)
          setProfile({
            displayName: info.displayName ?? 'Unknown User',
            email: info.email,
            picture: info.picture,
          });
      } catch {
        /* not authenticated */
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [identityApi]);

  if (!isAuthenticated) return null;

  const initials = profile ? getInitials(profile.displayName) : '?';
  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchor(e.currentTarget);
    setOpen(v => !v);
  };
  const handleLogout = async () => {
    setOpen(false);
    await identityApi.signOut();
  };

  return (
    <>
      <button
        className={classes.avatarBtn}
        onClick={toggle}
        aria-label="Open profile menu"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {profile?.picture ? (
          <Avatar
            className={classes.avatar}
            src={profile.picture}
            alt={profile.displayName}
          />
        ) : (
          <Avatar className={classes.avatar}>{initials}</Avatar>
        )}
      </button>

      <Popper
        open={open}
        anchorEl={anchor}
        placement="bottom-end"
        className={classes.popper}
        transition
        disablePortal={false}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={140}>
            <div>
              <ClickAwayListener onClickAway={() => setOpen(false)}>
                <Paper className={classes.paper} elevation={0} style={{ minWidth: 240 }}>
                  <div className={classes.profileHeader}>
                    {profile?.picture ? (
                      <Avatar
                        className={classes.profileAvatar}
                        src={profile.picture}
                        alt={profile?.displayName}
                      />
                    ) : (
                      <Avatar className={classes.profileAvatar}>{initials}</Avatar>
                    )}
                    {profile && (
                      <>
                        <Typography className={classes.profileName}>
                          {profile.displayName}
                        </Typography>
                        {profile.email && (
                          <Typography className={classes.profileEmail}>
                            {profile.email}
                          </Typography>
                        )}
                      </>
                    )}
                  </div>
                  <Divider />
                  <div className={classes.profileActions}>
                    <MenuItem
                      className={classes.profileMenuItem}
                      onClick={() => {
                        setOpen(false);
                        navigate('/settings');
                      }}
                    >
                      <SettingsOutlinedIcon className={classes.profileMenuIcon} />
                      Settings
                    </MenuItem>
                    <Divider style={{ margin: '4px 0' }} />
                    <MenuItem className={classes.logoutItem} onClick={handleLogout}>
                      <ExitToAppIcon className={classes.logoutIcon} />
                      Sign out
                    </MenuItem>
                  </div>
                </Paper>
              </ClickAwayListener>
            </div>
          </Fade>
        )}
      </Popper>
    </>
  );
}

// ─── Content Offset Shim ─────────────────────────────────────────────────────────

function NavbarContentShim() {
  useEffect(() => {
    const updateHeaders = () => {
      const hasPluginHeader = !!document.querySelector('.bui-PluginHeader');
      document
        .querySelectorAll<HTMLElement>('[data-backstage-core-header]')
        .forEach(header => {
          header.style.marginTop = hasPluginHeader ? '' : '50px';
        });
    };
    updateHeaders();
    const observer = new MutationObserver(updateHeaders);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, []);
  return null;
}

// ─── Main Navbar ─────────────────────────────────────────────────────────────────

function TopNavbar() {
  const classes = useStyles();
  const navigate = useNavigate();
  const identityApi = useApi(identityApiRef);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const theme = useTheme();
  // Tablet: md and below (< 1024px in MUI default breakpoints)
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    let cancelled = false;
    identityApi
      .getBackstageIdentity()
      .then(identity => {
        if (!cancelled && identity) setIsAuthenticated(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [identityApi]);

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(v => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <>
      <NavbarContentShim />

      <div className={classes.navbar} role="banner">
        {/* ── Search ──────────────────────────────────────────────────── */}
        <div
          className={classes.searchTrigger}
          onClick={() => setSearchOpen(true)}
          role="button"
          tabIndex={0}
          aria-label="Open search (⌘K)"
          onKeyDown={e => e.key === 'Enter' && setSearchOpen(true)}
        >
          <SearchIcon className={classes.searchIcon} />
          <span className={classes.searchPlaceholder}>
            {isTablet
              ? 'Search...'
              : 'Search for services, docs, people, repositories...'}
          </span>
          <span className={classes.searchKbd}>⌘K</span>
        </div>

        <div className={classes.spacer} />

        {/* ── Create ──────────────────────────────────────────────────── */}
        <CreateMenu />

        <div className={classes.dividerV} />

        {/* ── Shortcuts (desktop only — tablet sees OverflowMenu) ─────── */}
        {/* <Tooltip title="Tech Radar" placement="bottom">
          <Button
            className={classes.shortcutBtn}
            onClick={() => navigate('/tech-radar')}
            startIcon={
              <TrackChangesIcon
                className={classes.shortcutIcon}
                style={{ marginRight: 0 }}
              />
            }
          >
            TechRadar
          </Button>
        </Tooltip> */}

        <Tooltip title="TechDocs" placement="bottom">
          <Button
            className={classes.shortcutBtn}
            onClick={() => navigate('/docs')}
            startIcon={
              <MenuBookIcon
                className={classes.shortcutIcon}
                style={{ marginRight: 0 }}
              />
            }
          >
            Docs
          </Button>
        </Tooltip>

        {/* Tablet overflow ··· menu */}
        <OverflowMenu />

        <div className={classes.dividerVTablet} />

        {/* ── Notifications ────────────────────────────────────────────── */}
        <Tooltip title="Notifications" placement="bottom">
          <IconButton
            className={classes.iconBtn}
            onClick={() => navigate('/notifications')}
            aria-label="Notifications"
            size="small"
          >
            <Badge badgeContent={0} color="error" invisible>
              <NotificationsNoneIcon className={classes.iconBtnSvg} />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* ── Help (hidden on mobile) ──────────────────────────────────── */}
        <Tooltip title="Help" placement="bottom">
          <IconButton
            className={`${classes.iconBtn} ${classes.helpBtn}`}
            onClick={() => window.open('https://backstage.io/docs', '_blank')}
            aria-label="Help"
            size="small"
          >
            <HelpOutlineIcon className={classes.iconBtnSvg} />
          </IconButton>
        </Tooltip>

        <div className={classes.dividerVTablet} />

        {/* ── Profile ──────────────────────────────────────────────────── */}
        <ProfileMenu />
      </div>

      {/* ── Search modal ─────────────────────────────────────────────── */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

// ─── Module export ────────────────────────────────────────────────────────────────

const topNavbarElement = AppRootElementBlueprint.make({
  name: 'top-navbar',
  params: { element: <TopNavbar /> },
});

export const topNavbarModule = createFrontendModule({
  pluginId: 'app',
  extensions: [topNavbarElement],
});