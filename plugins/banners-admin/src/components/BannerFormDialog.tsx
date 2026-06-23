import React, { useState, useEffect } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { makeStyles } from '@material-ui/core/styles';
import { Banner, BannerInput } from '../api/BannersClient';

const useStyles = makeStyles(theme => ({
    dialogPaper: {
        borderRadius: 24,
        overflow: 'hidden',
    },

    dialogHeader: {
        background: 'linear-gradient(135deg,#7c3aed,#3b82f6)',
        color: '#fff',
        padding: '24px 32px',
    },

    dialogTitle: {
        fontWeight: 800,
        fontSize: '1.4rem',
    },

    dialogSubtitle: {
        opacity: 0.85,
        marginTop: 4,
        fontSize: '.9rem',
    },

    content: {
        padding: 32,
        background: '#fafbff',
    },

    section: {
        marginTop: 20,
        marginBottom: 12,
        fontWeight: 700,
        fontSize: '.75rem',
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        color: '#64748b',
    },

    field: {
        '& .MuiOutlinedInput-root': {
            borderRadius: 14,
            background: '#fff',
        },
    },

    previewCard: {
        marginTop: 24,
        padding: 20,
        borderRadius: 18,
        background:
            'linear-gradient(135deg,#7c3aed 0%, #8b5cf6 50%, #3b82f6 100%)',
        color: '#fff',
    },

    previewBadge: {
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: 20,
        background: 'rgba(255,255,255,.2)',
        marginBottom: 10,
        fontSize: '.75rem',
        fontWeight: 700,
    },

    previewTitle: {
        fontWeight: 700,
        fontSize: '1.1rem',
        marginBottom: 8,
    },

    previewMessage: {
        opacity: .9,
    },

    actionBar: {
        padding: 20,
        borderTop: '1px solid #e2e8f0',
        background: '#fff',
    },

    saveButton: {
        borderRadius: 12,
        padding: '10px 22px',
        fontWeight: 700,
        background:
            'linear-gradient(135deg,#7c3aed,#2563eb)',
        color: '#fff',
    },

    variantPreview: {
        width: 14,
        height: 14,
        borderRadius: '50%',
        display: 'inline-block',
        marginRight: 10,
    },
}));

const VARIANT_COLORS = {
    release: '#a78bfa',
    info: '#60a5fa',
    success: '#34d399',
    warning: '#fb923c',
};

const EMPTY_FORM: BannerInput = {
    title: '',
    message: '',
    variant: 'info',
    badge: '',
    ctaLabel: '',
    ctaHref: '',
    activeFrom: new Date().toISOString().split('T')[0],
    activeTo: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    enabled: true,
};

interface BannerFormDialogProps {
    open: boolean;
    banner?: Banner | null;
    onClose: () => void;
    onSave: (input: BannerInput, id?: string) => Promise<void>;
}

export function BannerFormDialog({ open, banner, onClose, onSave }: BannerFormDialogProps) {
    const classes = useStyles();
    const [form, setForm] = useState<BannerInput>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (banner) {
            setForm({
                title: banner.title,
                message: banner.message,
                variant: banner.variant,
                badge: banner.badge ?? '',
                ctaLabel: banner.ctaLabel ?? '',
                ctaHref: banner.ctaHref ?? '',
                activeFrom: banner.activeFrom,
                activeTo: banner.activeTo,
                enabled: banner.enabled,
            });
        } else {
            setForm(EMPTY_FORM);
        }
        setErrors({});
    }, [banner, open]);

    const set = (field: keyof BannerInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.title.trim()) e.title = 'Title is required';
        if (!form.message.trim()) e.message = 'Message is required';
        if (!form.activeFrom) e.activeFrom = 'Required';
        if (!form.activeTo) e.activeTo = 'Required';
        if (form.activeFrom && form.activeTo && form.activeTo < form.activeFrom)
            e.activeTo = 'Must be after Active From';
        return e;
    };

    const handleSave = async () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setSaving(true);
        try {
            await onSave(
                {
                    ...form,
                    badge: form.badge || undefined,
                    ctaLabel: form.ctaLabel || undefined,
                    ctaHref: form.ctaHref || undefined,
                },
                banner?.id,
            );
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            classes={{
                paper: classes.dialogPaper,
            }}
        >
            <DialogTitle className={classes.dialogHeader}>
                <div className={classes.dialogTitle}>
                    {banner ? '✏️ Edit Banner' : '🚀 Create Banner'}
                </div>

                <div className={classes.dialogSubtitle}>
                    Configure announcement content, schedule and CTA
                </div>
            </DialogTitle>
            <DialogContent
                dividers
                className={classes.content}
            >
                <div className={classes.section}>Content</div>
                <Grid container spacing={2}>
                    <Grid item xs={9}>
                        <TextField
                            className={classes.field}
                            label="Title *"
                            fullWidth
                            value={form.title}
                            onChange={set('title')}
                            error={!!errors.title}
                            helperText={errors.title}
                            variant="outlined"
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <TextField
                            className={classes.field}
                            label="Badge"
                            fullWidth
                            value={form.badge}
                            onChange={set('badge')}
                            placeholder="🚀"
                            variant="outlined"
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            className={classes.field}
                            label="Message *"
                            fullWidth
                            multiline
                            rows={2}
                            value={form.message}
                            onChange={set('message')}
                            error={!!errors.message}
                            helperText={errors.message}
                            variant="outlined"
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            className={classes.field}
                            select
                            label="Variant"
                            fullWidth
                            value={form.variant}
                            onChange={set('variant')}
                            variant="outlined"
                            size="small"
                        >
                            {(Object.keys(VARIANT_COLORS) as Array<keyof typeof VARIANT_COLORS>).map(v => (
                                <MenuItem key={v} value={v}>
                                    <span
                                        className={classes.variantPreview}
                                        style={{ background: VARIANT_COLORS[v] }}
                                    />
                                    {v.charAt(0).toUpperCase() + v.slice(1)}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>

                <div className={classes.section}>Call to Action</div>
                <Grid container spacing={2}>
                    <Grid item xs={5}>
                        <TextField
                            className={classes.field}
                            label="CTA Label"
                            fullWidth
                            value={form.ctaLabel}
                            onChange={set('ctaLabel')}
                            placeholder="See what's new"
                            variant="outlined"
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={7}>
                        <TextField
                            className={classes.field}
                            label="CTA Link"
                            fullWidth
                            value={form.ctaHref}
                            onChange={set('ctaHref')}
                            placeholder="/catalog/default/component/my-feature"
                            variant="outlined"
                            size="small"
                        />
                    </Grid>
                </Grid>

                <div className={classes.section}>Schedule</div>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField
                            className={classes.field}
                            label="Active From *"
                            type="date"
                            fullWidth
                            value={form.activeFrom}
                            onChange={set('activeFrom')}
                            error={!!errors.activeFrom}
                            helperText={errors.activeFrom}
                            InputLabelProps={{ shrink: true }}
                            variant="outlined"
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            className={classes.field}
                            label="Active To *"
                            type="date"
                            fullWidth
                            value={form.activeTo}
                            onChange={set('activeTo')}
                            error={!!errors.activeTo}
                            helperText={errors.activeTo}
                            InputLabelProps={{ shrink: true }}
                            variant="outlined"
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={form.enabled}
                                    onChange={e => setForm(prev => ({ ...prev, enabled: e.target.checked }))}
                                    color="primary"
                                />
                            }
                            label="Enabled"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions className={classes.actionBar}>
                <Button
                    onClick={onClose}
                    disabled={saving}
                >
                    Cancel
                </Button>

                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className={classes.saveButton}
                >
                    {saving ? 'Saving...' : 'Save Banner'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
