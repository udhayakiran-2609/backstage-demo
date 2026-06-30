import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Tooltip,
    Divider,
    Button,
    Menu,
    MenuItem,
} from '@material-ui/core';
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import AddIcon from '@material-ui/icons/Add';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import { useNavigate } from 'react-router-dom';
import { identityApiRef, useApi, errorApiRef } from '@backstage/core-plugin-api';
import { useUserProfile } from '@backstage/plugin-user-settings';
import SearchModal from './SearchModal';
import ProfileMenu from './ProfileMenu';

const useStyles = makeStyles(theme => ({
    appBar: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.drawer + 2,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0,0,0,0.08)',
        height: 56,
        justifyContent: 'center',
    },
    toolbar: {
        minHeight: 56,
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
        textDecoration: 'none',
        minWidth: 140,
        cursor: 'pointer',
    },
    logoIcon: {
        width: 28,
        height: 28,
        background: 'linear-gradient(135deg, #36BAF0 0%, #1565C0 100%)',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontWeight: 700,
        fontSize: 16,
        color: '#111827',
        letterSpacing: '-0.3px',
    },
    searchWrapper: {
        flex: 1,
        maxWidth: 480,
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
    },
    searchInput: {
        width: '100%',
        height: 36,
        border: '1.5px solid #e5e7eb',
        borderRadius: 8,
        padding: '0 12px',
        fontSize: 14,
        color: '#374151',
        backgroundColor: '#f9fafb',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        transition: 'border-color 0.15s, box-shadow 0.15s',
        '&:hover': {
            borderColor: '#9ca3af',
            backgroundColor: '#ffffff',
        },
    },
    searchPlaceholder: {
        fontSize: 13,
        color: '#9ca3af',
        flex: 1,
    },
    searchKbd: {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        background: '#f3f4f6',
        border: '1px solid #e5e7eb',
        borderRadius: 4,
        padding: '1px 5px',
        fontSize: 11,
        color: '#6b7280',
        fontFamily: 'monospace',
    },
    spacer: {
        flex: 1,
    },
    navActions: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
    },
    createButton: {
        backgroundColor: '#1565C0',
        color: '#ffffff',
        textTransform: 'none' as const,
        fontWeight: 600,
        fontSize: 13,
        borderRadius: 8,
        padding: '5px 12px',
        height: 34,
        '&:hover': {
            backgroundColor: '#1251A3',
        },
    },
    navTextButton: {
        textTransform: 'none' as const,
        fontWeight: 500,
        fontSize: 13,
        color: '#374151',
        borderRadius: 8,
        padding: '5px 10px',
        height: 34,
        '&:hover': {
            backgroundColor: '#f3f4f6',
            color: '#111827',
        },
    },
    iconButton: {
        width: 34,
        height: 34,
        borderRadius: 8,
        color: '#6b7280',
        '&:hover': {
            backgroundColor: '#f3f4f6',
            color: '#374151',
        },
    },
    divider: {
        height: 20,
        margin: '0 4px',
        backgroundColor: '#e5e7eb',
    },
    avatarButton: {
        width: 34,
        height: 34,
        borderRadius: '50%',
        padding: 0,
        overflow: 'hidden',
        border: '2px solid #e5e7eb',
        '&:hover': {
            borderColor: '#1565C0',
        },
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: '50%',
        objectFit: 'cover' as const,
    },
    avatarFallback: {
        width: 30,
        height: 30,
        borderRadius: '50%',
        backgroundColor: '#1565C0',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        fontWeight: 700,
    },
    createMenuPaper: {
        marginTop: 6,
        borderRadius: 10,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        border: '1px solid #e5e7eb',
        minWidth: 200,
    },
    createMenuItem: {
        fontSize: 13,
        padding: '8px 16px',
        '&:hover': {
            backgroundColor: '#f0f4ff',
        },
    },
}));

export const TopNavBar = () => {
    const classes = useStyles();
    const navigate = useNavigate();
    const identityApi = useApi(identityApiRef);
    const errorApi = useApi(errorApiRef);

    const [searchOpen, setSearchOpen] = useState(false);
    const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
    const [createAnchor, setCreateAnchor] = useState<null | HTMLElement>(null);

    // ── user profile ──────────────────────────────────────────────────────────
    // useUserProfile returns { profile: ProfileInfo, loading, error }
    // ProfileInfo has: displayName?, email?, picture?
    const { profile } = useUserProfile();
    const displayName: string = profile?.displayName ?? '';
    const email: string = profile?.email ?? '';
    const pictureUrl: string | undefined = profile?.picture;
    const initials: string = displayName
        ? displayName
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : email?.[0]?.toUpperCase() ?? 'U';

    const handleSignOut = async () => {
        try {
            setProfileAnchor(null);
            await identityApi.signOut();
        } catch (err: any) {
            errorApi.post(err);
        }
    };

    // Open search on ⌘K / Ctrl+K
    React.useEffect(() => {
        const updateHeaderMargin = () => {
            const hasPluginHeader = document.querySelector('.bui-PluginHeader');
            
            const headers = document.querySelectorAll<HTMLElement>(
                '[data-backstage-core-header]',
            );
            headers.forEach(header => {
                header.style.marginTop = hasPluginHeader ? '' : '50px !important';
            });
            console.log(headers);
            
        };

        // Initial run
        updateHeaderMargin();

        // Run again after route changes/rendering
        const timer = setTimeout(updateHeaderMargin, 100);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <AppBar className={classes.appBar} elevation={0}>
                <Toolbar className={classes.toolbar}>
                    {/* Logo */}
                    <div
                        className={classes.logo}
                        onClick={() => navigate('/')}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && navigate('/')}
                    >
                        <div className={classes.logoIcon}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path
                                    d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z"
                                    fill="white"
                                    fillOpacity="0.9"
                                />
                            </svg>
                        </div>
                        <Typography className={classes.logoText}>Backstage</Typography>
                    </div>

                    {/* Search trigger */}
                    <div className={classes.searchWrapper}>
                        <div
                            className={classes.searchInput}
                            onClick={() => setSearchOpen(true)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={e => e.key === 'Enter' && setSearchOpen(true)}
                            aria-label="Open search"
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#9ca3af"
                                strokeWidth="2.5"
                            >
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                            <span className={classes.searchPlaceholder}>
                                Search for services, docs, people, repositories...
                            </span>
                            <span className={classes.searchKbd}>⌘K</span>
                        </div>
                    </div>

                    <div className={classes.spacer} />

                    {/* Right actions */}
                    <div className={classes.navActions}>
                        {/* + Create */}
                        <Button
                            className={classes.createButton}
                            startIcon={<AddIcon style={{ fontSize: 16 }} />}
                            endIcon={<ArrowDropDownIcon style={{ fontSize: 18 }} />}
                            onClick={e => setCreateAnchor(e.currentTarget)}
                            disableElevation
                        >
                            Create
                        </Button>

                        <Menu
                            anchorEl={createAnchor}
                            open={Boolean(createAnchor)}
                            onClose={() => setCreateAnchor(null)}
                            getContentAnchorEl={null}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            PaperProps={{ className: classes.createMenuPaper }}
                        >
                            <MenuItem
                                className={classes.createMenuItem}
                                onClick={() => {
                                    setCreateAnchor(null);
                                    navigate('/create');
                                }}
                            >
                                Register Existing Component
                            </MenuItem>
                            <MenuItem
                                className={classes.createMenuItem}
                                onClick={() => {
                                    setCreateAnchor(null);
                                    navigate('/create');
                                }}
                            >
                                Create New Component
                            </MenuItem>
                        </Menu>

                        {/* TechRadar */}
                        <Button
                            className={classes.navTextButton}
                            startIcon={<MenuBookIcon style={{ fontSize: 15 }} />}
                            onClick={() => navigate('/tech-radar')}
                        >
                            TechRadar
                        </Button>

                        {/* Docs */}
                        <Button
                            className={classes.navTextButton}
                            onClick={() => navigate('/docs')}
                        >
                            Docs
                        </Button>

                        <Divider orientation="vertical" className={classes.divider} />

                        {/* Notifications */}
                        <Tooltip title="Notifications">
                            <IconButton className={classes.iconButton} size="small">
                                <NotificationsNoneIcon style={{ fontSize: 20 }} />
                            </IconButton>
                        </Tooltip>

                        {/* Help */}
                        <Tooltip title="Help">
                            <IconButton className={classes.iconButton} size="small">
                                <HelpOutlineIcon style={{ fontSize: 20 }} />
                            </IconButton>
                        </Tooltip>

                        <Divider orientation="vertical" className={classes.divider} />

                        {/* Profile avatar */}
                        <Tooltip title={displayName || email || 'Profile'}>
                            <IconButton
                                className={classes.avatarButton}
                                size="small"
                                onClick={e => setProfileAnchor(e.currentTarget)}
                                aria-label="Open profile menu"
                            >
                                {pictureUrl ? (
                                    <img src={pictureUrl} alt={displayName} className={classes.avatar} />
                                ) : (
                                    <div className={classes.avatarFallback}>{initials}</div>
                                )}
                            </IconButton>
                        </Tooltip>
                    </div>
                </Toolbar>
            </AppBar>

            {/* Search dialog */}
            <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

            {/* Profile dropdown */}
            <ProfileMenu
                anchorEl={profileAnchor}
                onClose={() => setProfileAnchor(null)}
                displayName={displayName}
                email={email}
                pictureUrl={pictureUrl}
                initials={initials}
                onSignOut={handleSignOut}
                onProfile={() => {
                    setProfileAnchor(null);
                    navigate('/settings');
                }}
                onSettings={() => {
                    setProfileAnchor(null);
                    navigate('/settings');
                }}
            />
        </>
    );
};

export default TopNavBar;
