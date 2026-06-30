import React, { useCallback, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  TextField,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { Rating } from '@material-ui/lab';
import {
  InfoCard,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useApi, alertApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { stringifyEntityRef } from '@backstage/catalog-model';
import useAsync from 'react-use/lib/useAsync';
import { feedbackApiRef, FeedbackRecord, FeedbackStatus } from '../../api';

const useStyles = makeStyles(theme => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  item: {
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
  },
  itemHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  empty: {
    color: theme.palette.text.secondary,
  },
}));

const statusColor: Record<FeedbackStatus, 'default' | 'primary' | 'secondary'> = {
  open: 'default',
  acknowledged: 'primary',
  resolved: 'primary',
  wontfix: 'secondary',
};

/**
 * Shows existing feedback for the current catalog entity and provides a
 * small form to submit new feedback. Designed to be dropped into an
 * entity page grid, e.g.:
 *
 *   <Grid item md={6}>
 *     <EntityFeedbackCard />
 *   </Grid>
 */
export const EntityFeedbackCard = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const entityRef = stringifyEntityRef(entity);
  const feedbackApi = useApi(feedbackApiRef);
  const alertApi = useApi(alertApiRef);

  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const { value, loading, error } = useAsync(async () => {
    return feedbackApi.listFeedback({ type: 'entity', entityRef, limit: 20 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityRef, refreshKey]);

  const handleSubmit = useCallback(async () => {
    if (!rating && !comment.trim()) {
      alertApi.post({
        message: 'Add a rating or a comment before submitting.',
        severity: 'warning',
      });
      return;
    }
    setSubmitting(true);
    try {
      await feedbackApi.createFeedback({
        type: 'entity',
        entityRef,
        rating,
        comment: comment.trim() || null,
        category: 'general',
      });
      setRating(null);
      setComment('');
      setRefreshKey(k => k + 1);
      alertApi.post({ message: 'Feedback submitted, thank you!', severity: 'success' });
    } catch (e) {
      alertApi.post({ message: `Failed to submit feedback: ${e}`, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  }, [rating, comment, entityRef, feedbackApi, alertApi]);

  return (
    <InfoCard title="Feedback">
      <div className={classes.form}>
        <Box>
          <Typography component="legend" variant="caption">
            Rate this entity
          </Typography>
          <Rating value={rating} onChange={(_, v) => setRating(v)} />
        </Box>
        <TextField
          fullWidth
          multiline
          minRows={2}
          placeholder="Share a comment about this service…"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting…' : 'Submit feedback'}
          </Button>
        </Box>
      </div>

      <Divider />

      {loading && <Progress />}
      {error && <ResponseErrorPanel error={error} />}
      {value && value.items.length === 0 && (
        <Typography variant="body2" className={classes.empty}>
          No feedback yet for this entity — be the first!
        </Typography>
      )}
      {value &&
        value.items.map((item: FeedbackRecord) => (
          <Box key={item.id} className={classes.item}>
            <div className={classes.itemHeader}>
              <Box display="flex" alignItems="center" gridGap={8}>
                {item.rating !== null && (
                  <Rating value={item.rating} readOnly size="small" />
                )}
                <Chip
                  size="small"
                  label={item.status}
                  color={statusColor[item.status]}
                />
              </Box>
              <Typography variant="caption" color="textSecondary">
                {new Date(item.createdAt).toLocaleDateString()}
              </Typography>
            </div>
            {item.comment && (
              <Typography variant="body2">{item.comment}</Typography>
            )}
          </Box>
        ))}
    </InfoCard>
  );
};
