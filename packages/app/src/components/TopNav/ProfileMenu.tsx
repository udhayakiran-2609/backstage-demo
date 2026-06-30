import { makeStyles } from '@material-ui/core/styles';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  Divider,
} from '@material-ui/core';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import PersonIcon from '@material-ui/icons/Person';
import SettingsIcon from '@material-ui/icons/Settings';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

const useStyles = makeStyles(() => ({
  paper: {
    marginTop: 8,
    borderRadius: 12,
    boxShadow: '0 8px 30px rgba(0,0,0,0.14)',
    border: '1px solid #e5e7eb',
    minWidth: 220,
    overflow: 'hidden',
  },
  profileHeader: {
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: '#f9fafb',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #e5e7eb',
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: '#1565C0',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    fontWeight: 700,
    border: '2px solid #e5e7eb',
    flexShrink: 0,
  },
  nameBlock: {
    display: 'flex',
    flexDirection: 'column',
  },
  displayName: {
    fontSize: 14,
    fontWeight: 600,
    color: '#111827',
    lineHeight: 1.3,
  },
  email: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 1.3,
    marginTop: 1,
  },
  menuItem: {
    padding: '9px 16px',
    fontSize: 13,
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    '&:hover': {
      backgroundColor: '#f0f4ff',
    },
  },
  menuItemIcon: {
    minWidth: 'unset',
    color: '#6b7280',
  },
  signOutItem: {
    padding: '9px 16px',
    fontSize: 13,
    color: '#dc2626',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    '&:hover': {
      backgroundColor: '#fef2f2',
    },
  },
  signOutIcon: {
    minWidth: 'unset',
    color: '#dc2626',
  },
  divider: {
    margin: '4px 0',
    backgroundColor: '#f3f4f6',
  },
}));

interface ProfileMenuProps {
  anchorEl: null | HTMLElement;
  onClose: () => void;
  displayName: string;
  email: string;
  pictureUrl?: string;
  initials: string;
  onSignOut: () => void;
  onProfile: () => void;
  onSettings: () => void;
}

const ProfileMenu = ({
  anchorEl,
  onClose,
  displayName,
  email,
  pictureUrl,
  initials,
  onSignOut,
  onProfile,
  onSettings,
}: ProfileMenuProps) => {
  const classes = useStyles();

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      getContentAnchorEl={null}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{ className: classes.paper }}
    >
      {/* Profile header */}
      <div className={classes.profileHeader}>
        {pictureUrl ? (
          <img src={pictureUrl} alt={displayName} className={classes.avatar} />
        ) : (
          <div className={classes.avatarFallback}>{initials}</div>
        )}
        <div className={classes.nameBlock}>
          {displayName && (
            <Typography className={classes.displayName}>{displayName}</Typography>
          )}
          {email && (
            <Typography className={classes.email}>{email}</Typography>
          )}
        </div>
      </div>

      <Divider className={classes.divider} />

      <MenuItem className={classes.menuItem} onClick={onProfile}>
        <ListItemIcon className={classes.menuItemIcon}>
          <PersonIcon style={{ fontSize: 17 }} />
        </ListItemIcon>
        Profile
      </MenuItem>

      <MenuItem className={classes.menuItem} onClick={onSettings}>
        <ListItemIcon className={classes.menuItemIcon}>
          <SettingsIcon style={{ fontSize: 17 }} />
        </ListItemIcon>
        Settings
      </MenuItem>

      <MenuItem className={classes.menuItem} onClick={onClose}>
        <ListItemIcon className={classes.menuItemIcon}>
          <HelpOutlineIcon style={{ fontSize: 17 }} />
        </ListItemIcon>
        Help & Docs
      </MenuItem>

      <Divider className={classes.divider} />

      <MenuItem className={classes.signOutItem} onClick={onSignOut}>
        <ListItemIcon className={classes.signOutIcon}>
          <ExitToAppIcon style={{ fontSize: 17 }} />
        </ListItemIcon>
        Sign out
      </MenuItem>
    </Menu>
  );
};

export default ProfileMenu;
