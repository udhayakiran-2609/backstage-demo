import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
  makeStyles,
} from '@material-ui/core';
import FeedbackIcon from '@material-ui/icons/Feedback';
import { Rating } from '@material-ui/lab';
import { useApi, alertApiRef } from '@backstage/core-plugin-api';
import { feedbackApiRef } from '../../api';

const useStyles = makeStyles(theme => ({
  fab: {
    position: 'fixed',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    zIndex: theme.zIndex.speedDial,
  },
  field: {
    marginTop: theme.spacing(2),
  },
}));

const CATEGORIES = [
  { value: 'bug', label: 'Bug report' },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'praise', label: 'Praise' },
  { value: 'docs', label: 'Documentation' },
  { value: 'other', label: 'Other' },
];

/**
 * A floating action button, available app-wide, that opens a dialog for
 * submitting general (not entity-scoped) feedback about Backstage itself.
 *
 * Usage (in packages/app/src/App.tsx, rendered alongside <Root>):
 *   <FeedbackWidget />
 */
export const FeedbackWidget = () => {
  const classes = useStyles();
  const feedbackApi = useApi(feedbackApiRef);
  const alertApi = useApi(alertApiRef);

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [category, setCategory] = useState('suggestion');
  const [comment, setComment] = useState('');

  const reset = () => {
    setRating(null);
    setCategory('suggestion');
    setComment('');
  };

  const handleClose = () => {
    if (!submitting) {
      setOpen(false);
    }
  };

  const handleSubmit = async () => {
    if (!rating && !comment.trim()) {
      alertApi.post({
        message: 'Please add a rating or a comment before submitting.',
        severity: 'warning',
      });
      return;
    }
    setSubmitting(true);
    try {
      await feedbackApi.createFeedback({
        type: 'general',
        rating,
        category,
        comment: comment.trim() || null,
      });
      alertApi.post({ message: 'Thanks for the feedback!', severity: 'success' });
      reset();
      setOpen(false);
    } catch (e) {
      alertApi.post({ message: `Failed to submit feedback: ${e}`, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Tooltip title="Give feedback">
        <Fab
          className={classes.fab}
          color="primary"
          size="medium"
          onClick={() => setOpen(true)}
          aria-label="Give feedback"
        >
          <FeedbackIcon />
        </Fab>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Share your feedback</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary">
            Tell us what's working, what isn't, or what you'd like to see in
            Backstage.
          </Typography>

          <div className={classes.field}>
            <Typography component="legend" variant="caption">
              Overall rating
            </Typography>
            <Rating
              value={rating}
              onChange={(_, value) => setRating(value)}
              size="large"
            />
          </div>

          <FormControl fullWidth className={classes.field}>
            <InputLabel id="feedback-category-label">Category</InputLabel>
            <Select
              labelId="feedback-category-label"
              value={category}
              onChange={e => setCategory(e.target.value as string)}
            >
              {CATEGORIES.map(c => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            className={classes.field}
            fullWidth
            multiline
            minRows={4}
            label="Comments"
            placeholder="What's on your mind?"
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
