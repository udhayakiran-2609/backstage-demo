import React, { useCallback, useEffect, useState } from 'react';
import {
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
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import SearchIcon from '@material-ui/icons/Search';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import LinkIcon from '@material-ui/icons/Link';
import EventIcon from '@material-ui/icons/Event';
import { bannersApiRef, Banner, BannerInput } from '../api/BannersClient';
import { BannerFormDialog } from './BannerFormDialog';

// ── Variant palette ────────────────────────────────────────────────────────
const VARIANT_META: Record<string, {
  label: string;
  color: string;
  bg: string;
  gradient: string;
  stripBg: string;
  stripText: string;
  stripAccent: string;
  stripBorder: string;
}> = {
  release: {
    label: 'Release',
    color: '#7c3aed',
    bg: '#f5f3ff',
    gradient: 'linear-gradient(135deg,#7c3aed,#6366f1)',
    stripBg: 'linear-gradient(90deg,#0d0d1a 0%,#1a1040 50%,#0d0d1a 100%)',
    stripText: '#e8e0ff',
    stripAccent: '#a78bfa',
    stripBorder: '#4c1d95',
  },
  info: {
    label: 'Info',
    color: '#2563eb',
    bg: '#eff6ff',
    gradient: 'linear-gradient(135deg,#2563eb,#0ea5e9)',
    stripBg: 'linear-gradient(90deg,#0c1a2e 0%,#0f2d4a 50%,#0c1a2e 100%)',
    stripText: '#bde0ff',
    stripAccent: '#60a5fa',
    stripBorder: '#1e3a5f',
  },
  success: {
    label: 'Success',
    color: '#059669',
    bg: '#ecfdf5',
    gradient: 'linear-gradient(135deg,#059669,#10b981)',
    stripBg: 'linear-gradient(90deg,#052e16 0%,#0a3d22 50%,#052e16 100%)',
    stripText: '#bbf7d0',
    stripAccent: '#34d399',
    stripBorder: '#065f46',
  },
  warning: {
    label: 'Warning',
    color: '#d97706',
    bg: '#fffbeb',
    gradient: 'linear-gradient(135deg,#d97706,#f97316)',
    stripBg: 'linear-gradient(90deg,#1c0a00 0%,#2d1200 50%,#1c0a00 100%)',
    stripText: '#fed7aa',
    stripAccent: '#fb923c',
    stripBorder: '#7c2d12',
  },
};

// ── Styles ─────────────────────────────────────────────────────────────────
const useStyles = makeStyles(theme => ({
  // Hero
  hero: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 20,
    padding: '32px 36px',
    marginBottom: 28,
    background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 45%,#1e3a5f 100%)',
    color: '#fff',
    boxShadow: '0 20px 48px rgba(15,23,42,0.22)',
    '&::before': {
      content: '""', position: 'absolute',
      width: 360, height: 360, borderRadius: '50%',
      background: 'rgba(139,92,246,0.12)',
      top: -120, right: -60, pointerEvents: 'none',
    },
    '&::after': {
      content: '""', position: 'absolute',
      width: 220, height: 220, borderRadius: '50%',
      background: 'rgba(96,165,250,0.08)',
      bottom: -80, left: -40, pointerEvents: 'none',
    },
  },
  heroInner: { position: 'relative', zIndex: 1 },
  heroTitle: { fontWeight: 800, fontSize: '1.9rem', letterSpacing: '-0.02em' },
  heroSub: { marginTop: 6, opacity: 0.75, fontSize: '0.9rem', maxWidth: 600 },
  heroPills: { display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' as const },
  heroPill: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 16px', borderRadius: 40,
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(8px)',
    fontSize: '0.82rem', fontWeight: 600, color: '#fff',
    border: '1px solid rgba(255,255,255,0.15)',
  },
  heroPillDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },

  // Toolbar
  toolbar: {
    display: 'flex', alignItems: 'center', gap: 12,
    marginBottom: 24, flexWrap: 'wrap' as const,
  },
  searchField: {
    flex: 1, minWidth: 200, maxWidth: 340,
    '& .MuiOutlinedInput-root': { borderRadius: 10, background: '#fff' },
  },
  filterGroup: {
    '& .MuiToggleButton-root': {
      textTransform: 'none', fontWeight: 600,
      fontSize: '0.78rem', padding: '5px 14px', borderRadius: '8px !important',
      border: '1px solid #e5e7eb !important',
    },
    '& .Mui-selected': {
      background: '#1e3a5f !important', color: '#fff !important',
    },
  },
  spacer: { flex: 1 },
  newBtn: {
    borderRadius: 10, fontWeight: 700, padding: '8px 20px',
    background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 45%,#1e3a5f 100%)',
    color: '#fff', boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
    '&:hover': { background: 'linear-gradient(135deg,#0f172a,#1e1b4b)' },
  },

  // Banner card
  card: {
    borderRadius: 16,
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    height: '100%', display: 'flex', flexDirection: 'column' as const,
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 12px 28px rgba(15,23,42,0.1)',
    },
  },
  cardAccent: { height: 4, borderRadius: '16px 16px 0 0' },
  cardBody: { flex: 1, padding: theme.spacing(2.5) },
  cardTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 12,
  },
  variantBadge: {
    fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.06em',
    padding: '3px 10px', borderRadius: 6,
  },
  liveBadge: {
    display: 'flex', alignItems: 'center', gap: 4,
    fontWeight: 700, fontSize: '0.7rem', padding: '3px 10px',
    borderRadius: 6,
  },
  liveDot: {
    width: 6, height: 6, borderRadius: '50%',
    animation: '$pulse 2s ease-in-out infinite',
  },
  '@keyframes pulse': {
    '0%,100%': { opacity: 1 },
    '50%': { opacity: 0.4 },
  },
  cardTitle: { fontWeight: 700, fontSize: '1rem', marginBottom: 6 },
  cardMsg: { color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5, minHeight: 44 },

  // Meta row (date + cta)
  metaRow: {
    display: 'flex', alignItems: 'center', gap: 6,
    marginTop: 14, flexWrap: 'wrap' as const,
  },
  metaChip: {
    display: 'flex', alignItems: 'center', gap: 4,
    fontSize: '0.73rem', color: '#64748b',
    background: '#f1f5f9', borderRadius: 6,
    padding: '3px 8px', fontFamily: 'monospace',
  },
  metaIcon: { fontSize: '0.78rem', opacity: 0.6 },

  // Live preview strip
  previewWrap: { padding: '0 16px 16px' },
  previewLabel: {
    fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase' as const, color: '#94a3b8', marginBottom: 6,
  },
  previewStrip: {
    borderRadius: 8, padding: '8px 14px',
    display: 'flex', alignItems: 'center', gap: 10,
    fontSize: '0.78rem', overflow: 'hidden',
  },
  previewTitle: {
    fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.08em',
    textTransform: 'uppercase' as const, padding: '2px 7px',
    borderRadius: 4, flexShrink: 0,
  },
  previewMsg: { opacity: 0.85, fontSize: '0.78rem', flex: 1, minWidth: 0,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },

  // Card footer
  cardFooter: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', padding: '10px 16px 14px',
  },
  footerLeft: { display: 'flex', alignItems: 'center', gap: 4 },
  footerRight: { display: 'flex', alignItems: 'center', gap: 2 },
  editBtn: { borderRadius: 8, padding: 6 },
  deleteBtn: { borderRadius: 8, padding: 6, color: '#ef4444',
    '&:hover': { background: '#fef2f2' } },

  // Empty
  emptyWrap: {
    textAlign: 'center', padding: theme.spacing(8),
    background: '#fff', borderRadius: 16, border: '1px dashed #e5e7eb',
  },
  emptyIcon: { fontSize: '3rem', marginBottom: 12 },
}));

function isLive(b: Banner): boolean {
  const today = new Date().toISOString().split('T')[0];
  return b.enabled && b.activeFrom <= today && b.activeTo >= today;
}

// ── Banner live-preview strip ──────────────────────────────────────────────
function PreviewStrip({ banner }: { banner: Banner }) {
  const classes = useStyles();
  const m = VARIANT_META[banner.variant] ?? VARIANT_META.info;
  return (
    <div>
      <div className={classes.previewLabel}>Live preview</div>
      <div className={classes.previewStrip} style={{ background: m.stripBg }}>
        {banner.badge && <span style={{ fontSize: '1rem' }}>{banner.badge}</span>}
        <span
          className={classes.previewTitle}
          style={{
            color: m.stripAccent,
            background: `${m.stripAccent}18`,
            border: `1px solid ${m.stripAccent}40`,
          }}
        >
          {banner.title}
        </span>
        <span className={classes.previewMsg} style={{ color: m.stripText }}>
          {banner.message}
        </span>
        {banner.ctaLabel && (
          <span style={{
            color: m.stripAccent, fontWeight: 600, fontSize: '0.73rem',
            flexShrink: 0, opacity: 0.9,
          }}>
            {banner.ctaLabel} →
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
type FilterType = 'all' | 'live' | 'inactive';

export function BannerAdminPage() {
  const classes = useStyles();
  const api = useApi(bannersApiRef);

  const [banners, setBanners]           = useState<Banner[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<Error | null>(null);
  const [formOpen, setFormOpen]         = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deleteTarget, setDeleteTarget]   = useState<Banner | null>(null);
  const [search, setSearch]             = useState('');
  const [filter, setFilter]             = useState<FilterType>('all');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.getAll();
      setBanners(Array.isArray(result) ? result : []);
    } catch (e: any) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (input: BannerInput, id?: string) => {
    if (id) await api.update(id, input);
    else await api.create(input);
    await load();
  };

  const handleToggle = async (banner: Banner) => {
    try {
      await api.toggle(banner.id);
      setBanners(prev =>
        prev.map(b => b.id === banner.id ? { ...b, enabled: !b.enabled } : b),
      );
    } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(deleteTarget.id);
    setDeleteTarget(null);
    await load();
  };

  if (loading) return <Progress />;
  if (error)   return <ResponseErrorPanel error={error} />;

  const safeBanners = Array.isArray(banners) ? banners : [];
  const liveCount     = safeBanners.filter(isLive).length;
  const disabledCount = safeBanners.filter(b => !b.enabled).length;

  const filtered = safeBanners
    .filter(b => {
      if (filter === 'live')     return isLive(b);
      if (filter === 'inactive') return !isLive(b);
      return true;
    })
    .filter(b =>
      !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.message.toLowerCase().includes(search.toLowerCase()),
    );

  return (
    <div>
      <div style={{ padding: "24px 24px 48px", maxWidth: 1400, margin: "0 auto" }}>
        {/* ── Hero ── */}
        <div className={classes.hero}>
          <div className={classes.heroInner}>
            <Typography className={classes.heroTitle}>
              📢 Announcement Center
            </Typography>
            <Typography className={classes.heroSub}>
              Create, schedule and manage platform-wide announcements, release
              updates and maintenance notifications across Backstage.
            </Typography>
            <div className={classes.heroPills}>
              <span className={classes.heroPill}>
                <span className={classes.heroPillDot}
                  style={{ background: '#a78bfa' }} />
                {safeBanners.length} Total
              </span>
              <span className={classes.heroPill}>
                <span className={classes.heroPillDot}
                  style={{ background: '#34d399' }} />
                {liveCount} Live now
              </span>
              <span className={classes.heroPill}>
                <span className={classes.heroPillDot}
                  style={{ background: '#fb923c' }} />
                {disabledCount} Disabled
              </span>
            </div>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className={classes.toolbar}>
          <TextField
            className={classes.searchField}
            variant="outlined"
            size="small"
            placeholder="Search banners…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: '#94a3b8', fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
          />

          <ToggleButtonGroup
            className={classes.filterGroup}
            exclusive
            size="small"
            value={filter}
            onChange={(_e, v) => { if (v) setFilter(v); }}
          >
            <ToggleButton value="all">All ({safeBanners.length})</ToggleButton>
            <ToggleButton value="live">Live ({liveCount})</ToggleButton>
            <ToggleButton value="inactive">
              Inactive ({safeBanners.length - liveCount})
            </ToggleButton>
          </ToggleButtonGroup>

          <div className={classes.spacer} />

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            className={classes.newBtn}
            onClick={() => { setEditingBanner(null); setFormOpen(true); }}
          >
            New Banner
          </Button>
        </div>

        {/* ── Empty state ── */}
        {filtered.length === 0 && (
          <Paper elevation={0} className={classes.emptyWrap}>
            <div className={classes.emptyIcon}>🪄</div>
            <Typography variant="h6" style={{ fontWeight: 700 }}>
              {search || filter !== 'all' ? 'No banners match' : 'No banners yet'}
            </Typography>
            <Typography variant="body2" style={{ color: '#64748b', marginTop: 6 }}>
              {search || filter !== 'all'
                ? 'Try a different search or filter.'
                : 'Click New Banner to create your first announcement.'}
            </Typography>
          </Paper>
        )}

        {/* ── Cards ── */}
        <Grid container spacing={3}>
          {filtered.map(banner => {
            const live = isLive(banner);
            const m = VARIANT_META[banner.variant] ?? VARIANT_META.info;

            return (
              <Grid item xs={12} md={6} lg={4} key={banner.id}>
                <Card className={classes.card} elevation={0}>

                  {/* Coloured top accent bar */}
                  <div
                    className={classes.cardAccent}
                    style={{ background: m.gradient }}
                  />

                  <CardContent className={classes.cardBody}>
                    {/* Top row — variant + live badges */}
                    <div className={classes.cardTop}>
                      <span
                        className={classes.variantBadge}
                        style={{ background: m.bg, color: m.color }}
                      >
                        {m.label.toUpperCase()}
                      </span>
                      <span
                        className={classes.liveBadge}
                        style={{
                          background: live ? '#dcfce7' : '#f3f4f6',
                          color: live ? '#15803d' : '#6b7280',
                        }}
                      >
                        <span
                          className={classes.liveDot}
                          style={{ background: live ? '#22c55e' : '#9ca3af' }}
                        />
                        {live ? 'LIVE' : 'INACTIVE'}
                      </span>
                    </div>

                    {/* Title + message */}
                    <Typography className={classes.cardTitle}>
                      {banner.badge && `${banner.badge} `}{banner.title}
                    </Typography>
                    <Typography variant="body2" className={classes.cardMsg}>
                      {banner.message}
                    </Typography>

                    {/* Date + CTA meta chips */}
                    <div className={classes.metaRow}>
                      <span className={classes.metaChip}>
                        <EventIcon className={classes.metaIcon} />
                        {banner.activeFrom} → {banner.activeTo}
                      </span>
                      {banner.ctaLabel && (
                        <span className={classes.metaChip}>
                          <LinkIcon className={classes.metaIcon} />
                          {banner.ctaLabel}
                        </span>
                      )}
                    </div>
                  </CardContent>

                  {/* Live preview */}
                  <div className={classes.previewWrap}>
                    <PreviewStrip banner={banner} />
                  </div>

                  <Divider />

                  {/* Footer — toggle + edit/delete */}
                  <div className={classes.cardFooter}>
                    <div className={classes.footerLeft}>
                      <Switch
                        checked={Boolean(banner.enabled)}
                        onChange={() => handleToggle(banner)}
                        color="primary"
                        size="small"
                      />
                      <Typography variant="caption" style={{ color: '#64748b' }}>
                        {banner.enabled ? 'Enabled' : 'Disabled'}
                      </Typography>
                    </div>

                    <div className={classes.footerRight}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          className={classes.editBtn}
                          onClick={() => { setEditingBanner(banner); setFormOpen(true); }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          className={classes.deleteBtn}
                          onClick={() => setDeleteTarget(banner)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>

                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Dialogs */}
        <BannerFormDialog
          open={formOpen}
          banner={editingBanner}
          onClose={() => setFormOpen(false)}
          onSave={handleSave}
        />

        <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
          <DialogTitle>Delete banner?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              "<strong>{deleteTarget?.title}</strong>" will be permanently deleted
              and removed from all pages immediately.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button color="secondary" variant="contained" onClick={handleDelete}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}
