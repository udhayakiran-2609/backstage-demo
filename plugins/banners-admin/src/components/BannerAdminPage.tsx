import React, { useCallback, useEffect, useState } from 'react';
import {
    Page,
    Content,
    Progress,
    ResponseErrorPanel,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Chip from '@material-ui/core/Chip';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { bannersApiRef, Banner, BannerInput } from '../api/BannersClient';
import { BannerFormDialog } from './BannerFormDialog';

const VARIANT_COLORS: Record<string, { bg: string; text: string }> = {
    release: { bg: '#4c1d95', text: '#e9d5ff' },
    info: { bg: '#1e3a5f', text: '#bfdbfe' },
    success: { bg: '#064e3b', text: '#a7f3d0' },
    warning: { bg: '#7c2d12', text: '#fed7aa' },
};

const useStyles = makeStyles(theme => ({
    page: {
        background: '#f8fafc',
        minHeight: '100vh',
    },

    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing(3),
    },

    statsCard: {
        borderRadius: 18,
        padding: theme.spacing(1),
        background: '#fff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
    },

    statNumber: {
        fontWeight: 700,
        fontSize: '2rem',
    },

    statLabel: {
        color: '#64748b',
        fontSize: '.85rem',
    },

    bannerCard: {
        borderRadius: 18,
        border: '1px solid #e5e7eb',
        transition: 'all .25s ease',
        height: '100%',

        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 15px 30px rgba(15,23,42,0.08)',
        },
    },

    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing(2),
    },

    title: {
        fontWeight: 700,
        marginBottom: 4,
    },

    message: {
        color: '#64748b',
        minHeight: 50,
    },

    schedule: {
        fontSize: '.8rem',
        color: '#94a3b8',
        marginTop: 12,
    },

    actions: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.spacing(2),
    },

    emptyState: {
        textAlign: 'center',
        padding: theme.spacing(8),
    },
    heroBanner: {
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 24,
        padding: '36px 40px',
        marginBottom: 32,

        background: `
    linear-gradient(
      135deg,
      #7c3aed 0%,
      #8b5cf6 35%,
      #6366f1 70%,
      #2563eb 100%
    )
  `,

        color: '#fff',

        boxShadow:
            '0 20px 40px rgba(99,102,241,0.25)',

        '&::before': {
            content: '""',
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            top: -100,
            right: -50,
        },

        '&::after': {
            content: '""',
            position: 'absolute',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            bottom: -80,
            left: -50,
        },
    },

    heroTitle: {
        fontSize: '2rem',
        fontWeight: 800,
        position: 'relative',
        zIndex: 1,
    },

    heroSubtitle: {
        marginTop: 8,
        opacity: 0.9,
        maxWidth: 700,
        position: 'relative',
        zIndex: 1,
    },

    heroStats: {
        display: 'flex',
        gap: 12,
        marginTop: 24,
        position: 'relative',
        zIndex: 1,
    },

    heroChip: {
        padding: '10px 18px',
        borderRadius: 12,
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(12px)',
        fontWeight: 600,
    },
    bannerPage: {
        '& main': {
            marginTop: 'unset !important',
        },

        '& [class*="BackstageContent-root"]': {
            marginTop: 'unset !important',
        },
    },
}));

function isLive(banner: Banner): boolean {
    const today = new Date().toISOString().split('T')[0];
    return banner.enabled && banner.activeFrom <= today && banner.activeTo >= today;
}

export function BannerAdminPage() {
    const classes = useStyles();
    const api = useApi(bannersApiRef);

    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setBanners(await api.getAll());
        } catch (e: any) {
            setError(e);
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => { load(); }, [load]);

    const handleSave = async (input: BannerInput, id?: string) => {
        if (id) {
            await api.update(id, input);
        } else {
            await api.create(input);
        }
        await load();
    };

    const handleToggle = async (banner: Banner) => {
        try {
            await api.toggle(banner.id);

            setBanners(prev =>
                prev.map(item =>
                    item.id === banner.id
                        ? { ...item, enabled: !item.enabled }
                        : item,
                ),
            );
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await api.delete(deleteTarget.id);
        setDeleteTarget(null);
        await load();
    };

    if (loading) return <Progress />;
    if (error) return <ResponseErrorPanel error={error} />;

    return (
        <Page themeId="tool" className={classes.bannerPage}>
            <Content>
                <div className={classes.heroBanner}>
                    <Typography className={classes.heroTitle}>
                        📢 Announcement Center
                    </Typography>

                    <Typography className={classes.heroSubtitle}>
                        Create, schedule and manage platform-wide announcements,
                        release updates and maintenance notifications.
                    </Typography>
                </div>
                <div className={classes.toolbar}>
                    <Typography variant="h5">
                        Banner Management
                    </Typography>

                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setEditingBanner(null);
                            setFormOpen(true);
                        }}
                    >
                        New Banner
                    </Button>
                </div>

                {/* KPI Cards */}

                <Grid container spacing={3} style={{ marginBottom: 24 }}>
                    <Grid item xs={12} md={4}>
                        <Card className={classes.statsCard}>
                            <CardContent>
                                <Typography className={classes.statNumber}>
                                    {banners.length}
                                </Typography>
                                <Typography className={classes.statLabel}>
                                    Total Banners
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card className={classes.statsCard}>
                            <CardContent>
                                <Typography
                                    className={classes.statNumber}
                                    style={{ color: '#10b981' }}
                                >
                                    {banners.filter(isLive).length}
                                </Typography>
                                <Typography className={classes.statLabel}>
                                    Live Banners
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card className={classes.statsCard}>
                            <CardContent>
                                <Typography
                                    className={classes.statNumber}
                                    style={{ color: '#f59e0b' }}
                                >
                                    {banners.filter(x => !x.enabled).length}
                                </Typography>
                                <Typography className={classes.statLabel}>
                                    Disabled
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {banners.length === 0 && (
                    <Paper className={classes.emptyState}>
                        <Typography variant="h6">
                            No banners found
                        </Typography>
                        <Typography variant="body2">
                            Create your first announcement banner
                        </Typography>
                    </Paper>
                )}

                <Grid container spacing={3}>
                    {banners.map(banner => {
                        const live = isLive(banner);

                        const variantColor =
                            banner.variant === 'release'
                                ? '#7c3aed'
                                : banner.variant === 'success'
                                    ? '#10b981'
                                    : banner.variant === 'warning'
                                        ? '#f97316'
                                        : '#2563eb';

                        return (
                            <Grid item xs={12} md={6} lg={4} key={banner.id}>
                                <Card className={classes.bannerCard}>
                                    <CardContent>

                                        <div className={classes.cardHeader}>
                                            <Chip
                                                size="small"
                                                label={banner.variant.toUpperCase()}
                                                style={{
                                                    background: `${variantColor}15`,
                                                    color: variantColor,
                                                    fontWeight: 700,
                                                }}
                                            />

                                            <Chip
                                                size="small"
                                                label={live ? 'LIVE' : 'INACTIVE'}
                                                style={{
                                                    background: live
                                                        ? '#dcfce7'
                                                        : '#f3f4f6',

                                                    color: live
                                                        ? '#15803d'
                                                        : '#6b7280',

                                                    fontWeight: 700,
                                                }}
                                            />
                                        </div>

                                        <Typography
                                            variant="h6"
                                            className={classes.title}
                                        >
                                            {banner.badge} {banner.title}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            className={classes.message}
                                        >
                                            {banner.message}
                                        </Typography>

                                        <Typography className={classes.schedule}>
                                            {banner.activeFrom} → {banner.activeTo}
                                        </Typography>

                                        {banner.ctaLabel && (
                                            <Typography
                                                style={{
                                                    marginTop: 12,
                                                    fontSize: '.85rem',
                                                    color: '#2563eb',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                CTA: {banner.ctaLabel}
                                            </Typography>
                                        )}

                                        <Divider style={{ margin: '16px 0' }} />

                                        <div className={classes.actions}>
                                            <Switch
                                                checked={banner.enabled}
                                                onChange={() => handleToggle(banner)}
                                                color="primary"
                                            />

                                            <div>
                                                <IconButton
                                                    onClick={() => {
                                                        setEditingBanner(banner);
                                                        setFormOpen(true);
                                                    }}
                                                >
                                                    <EditIcon />
                                                </IconButton>

                                                <IconButton
                                                    onClick={() =>
                                                        setDeleteTarget(banner)
                                                    }
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </div>
                                        </div>

                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>

                <BannerFormDialog
                    open={formOpen}
                    banner={editingBanner}
                    onClose={() => setFormOpen(false)}
                    onSave={handleSave}
                />

                <Dialog
                    open={!!deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                >
                    <DialogTitle>
                        Delete Banner
                    </DialogTitle>

                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete
                            "{deleteTarget?.title}"?
                        </DialogContentText>
                    </DialogContent>

                    <DialogActions>
                        <Button
                            onClick={() =>
                                setDeleteTarget(null)
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            color="secondary"
                            variant="contained"
                            onClick={handleDelete}
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </Content>
        </Page>
    );
}
