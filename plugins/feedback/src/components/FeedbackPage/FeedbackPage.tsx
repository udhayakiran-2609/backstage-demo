import React, { useState } from 'react';
import {
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Box,
} from '@material-ui/core';
import { Rating } from '@material-ui/lab';
import {
  Content,
  ContentHeader,
  Header,
  Page,
  Progress,
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { useApi, alertApiRef } from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import { feedbackApiRef, FeedbackRecord, FeedbackStatus } from '../../api';

const STATUS_OPTIONS: (FeedbackStatus | 'all')[] = [
  'all',
  'open',
  'acknowledged',
  'resolved',
  'wontfix',
];

const statusColor: Record<FeedbackStatus, 'default' | 'primary' | 'secondary'> = {
  open: 'default',
  acknowledged: 'primary',
  resolved: 'primary',
  wontfix: 'secondary',
};

/**
 * Admin-facing page listing all submitted feedback (general + entity),
 * with filtering by status and inline status triage. Mount at a route
 * such as /feedback via the FeedbackPage routable extension.
 */
export const FeedbackPage = () => {
  const feedbackApi = useApi(feedbackApiRef);
  const alertApi = useApi(alertApiRef);
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'all'>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const { value, loading, error } = useAsync(async () => {
    return feedbackApi.listFeedback({
      status: statusFilter === 'all' ? undefined : statusFilter,
      limit: 200,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, refreshKey]);

  const handleStatusChange = async (id: string, status: FeedbackStatus) => {
    try {
      await feedbackApi.updateFeedback(id, { status });
      setRefreshKey(k => k + 1);
    } catch (e) {
      alertApi.post({ message: `Failed to update status: ${e}`, severity: 'error' });
    }
  };

  const columns: TableColumn<FeedbackRecord>[] = [
    {
      title: 'Type',
      field: 'type',
      width: '90px',
      render: row => <Chip size="small" label={row.type} />,
    },
    {
      title: 'Entity',
      field: 'entityRef',
      render: row => row.entityRef ?? '—',
    },
    {
      title: 'Rating',
      field: 'rating',
      width: '140px',
      render: row =>
        row.rating !== null ? <Rating value={row.rating} readOnly size="small" /> : '—',
    },
    { title: 'Category', field: 'category', width: '120px' },
    { title: 'Comment', field: 'comment', render: row => row.comment ?? '—' },
    { title: 'Submitted by', field: 'createdBy', render: row => row.createdBy ?? 'anonymous' },
    {
      title: 'Created',
      field: 'createdAt',
      width: '160px',
      render: row => new Date(row.createdAt).toLocaleString(),
    },
    {
      title: 'Status',
      field: 'status',
      width: '180px',
      render: row => (
        <FormControl size="small">
          <Select
            value={row.status}
            onChange={e =>
              handleStatusChange(row.id, e.target.value as FeedbackStatus)
            }
          >
            {(['open', 'acknowledged', 'resolved', 'wontfix'] as FeedbackStatus[]).map(
              s => (
                <MenuItem key={s} value={s}>
                  <Chip size="small" label={s} color={statusColor[s]} />
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>
      ),
    },
  ];

  return (
    <Page themeId="tool">
      <Header title="Feedback" subtitle="All feedback submitted across Backstage" />
      <Content>
        <ContentHeader title="">
          <FormControl style={{ minWidth: 160 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as FeedbackStatus | 'all')}
            >
              {STATUS_OPTIONS.map(s => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </ContentHeader>

        {loading && <Progress />}
        {error && <ResponseErrorPanel error={error} />}
        {value && (
          <Box>
            <Table
              title={`Feedback (${value.totalCount})`}
              columns={columns}
              data={value.items}
              options={{ search: true, paging: true, pageSize: 20 }}
            />
          </Box>
        )}
      </Content>
    </Page>
  );
};
