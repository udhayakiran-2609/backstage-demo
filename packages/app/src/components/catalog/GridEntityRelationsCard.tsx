/**
 * GridEntityRelationsCard.tsx
 * Drop-in replacement for Backstage's default entity relations tables.
 * Renders Provided APIs, Consumed APIs, Depends on Components,
 * Depends on Resources, and Has Subcomponents as modern grid cards.
 *
 * Compatible with: Backstage 1.52.0
 * Usage: Import in your EntityPage and replace the default table cards.
 */

import React, { useState } from 'react';
import {
  Entity,
  RELATION_PROVIDES_API,
  RELATION_CONSUMES_API,
  RELATION_DEPENDS_ON,
  RELATION_HAS_PART,
} from '@backstage/catalog-model';
import { useEntity, useRelatedEntities } from '@backstage/plugin-catalog-react';
import {
  InfoCard,
  Link,
  EmptyState,
} from '@backstage/core-components';
import {
  Box,
  Chip,
  Grid,
  makeStyles,
  Theme,
  Typography,
  Tooltip,
  IconButton,
  TextField,
  InputAdornment,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import StorageIcon from '@material-ui/icons/Storage';
import ExtensionIcon from '@material-ui/icons/Extension';
import ApiIcon from '@material-ui/icons/SettingsEthernet';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import ViewModuleIcon from '@material-ui/icons/ViewModule';

// ─── Styles ────────────────────────────────────────────────────────────────────

const useStyles = makeStyles((theme: Theme) => ({
  sectionRoot: {
    marginBottom: theme.spacing(3),
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(1.5),
    borderBottom: `2px solid ${theme.palette.primary.main}`,
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    fontWeight: 700,
    fontSize: '1.05rem',
    color: theme.palette.text.primary,
    letterSpacing: '-0.01em',
  },
  sectionIcon: {
    color: theme.palette.primary.main,
    fontSize: '1.2rem',
  },
  countBadge: {
    background: theme.palette.primary.main,
    color: '#fff',
    borderRadius: 20,
    padding: '2px 10px',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    minWidth: 28,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 8,
      height: 34,
      fontSize: '0.82rem',
      background: theme.palette.background.paper,
    },
  },
  card: {
    background: theme.palette.background.paper,
    border: `1.5px solid ${theme.palette.divider}`,
    borderRadius: 12,
    padding: theme.spacing(2, 2.5),
    transition: 'all 0.18s ease',
    cursor: 'default',
    position: 'relative',
    overflow: 'hidden',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 4px 20px ${theme.palette.primary.main}22`,
      transform: 'translateY(-2px)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: 4,
      height: '100%',
      background: theme.palette.primary.main,
      opacity: 0,
      transition: 'opacity 0.18s ease',
    },
    '&:hover::before': {
      opacity: 1,
    },
  },
  cardName: {
    fontWeight: 700,
    fontSize: '0.92rem',
    color: theme.palette.primary.main,
    lineHeight: 1.3,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  cardMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.75),
    marginTop: theme.spacing(1),
    alignItems: 'center',
  },
  chip: {
    borderRadius: 6,
    height: 22,
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.02em',
  },
  chipType: {
    background: `${theme.palette.primary.main}18`,
    color: theme.palette.primary.main,
    border: `1px solid ${theme.palette.primary.main}40`,
  },
  chipLifecycle: {
    background: '#10b98118',
    color: '#10b981',
    border: '1px solid #10b98140',
  },
  chipLifecycleDeprecated: {
    background: '#f5952218',
    color: '#f59522',
    border: '1px solid #f5952240',
  },
  chipOwner: {
    background: theme.palette.type === 'dark' ? '#ffffff10' : '#00000008',
    color: theme.palette.text.secondary,
    border: `1px solid ${theme.palette.divider}`,
  },
  description: {
    fontSize: '0.78rem',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.75),
    lineHeight: 1.5,
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden',
  },
  openBtn: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    opacity: 0,
    transition: 'opacity 0.15s',
    padding: 4,
    '$card:hover &': {
      opacity: 1,
    },
  },
  emptyBox: {
    textAlign: 'center',
    padding: theme.spacing(4, 2),
    color: theme.palette.text.disabled,
    '& svg': {
      fontSize: '2.5rem',
      marginBottom: theme.spacing(1),
      opacity: 0.35,
    },
  },
  emptyText: {
    fontSize: '0.85rem',
    color: theme.palette.text.disabled,
  },
  learnMore: {
    fontSize: '0.78rem',
    marginTop: theme.spacing(0.5),
    display: 'inline-block',
    color: theme.palette.primary.main,
  },
}));

// ─── Helpers ───────────────────────────────────────────────────────────────────

function lifecycleColor(lc?: string) {
  if (!lc) return 'chipLifecycle';
  if (['deprecated', 'end-of-life'].includes(lc.toLowerCase())) return 'chipLifecycleDeprecated';
  return 'chipLifecycle';
}

function entityUrl(entity: Entity) {
  const ns = entity.metadata.namespace ?? 'default';
  const kind = entity.kind.toLowerCase();
  return `/catalog/${ns}/${kind}/${entity.metadata.name}`;
}

// ─── Single relation card ─────────────────────────────────────────────────────

interface RelationCardProps {
  entity: Entity;
}

const RelationCard: React.FC<RelationCardProps> = ({ entity }) => {
  const classes = useStyles();
  const meta = entity.metadata;
  const spec = entity.spec as Record<string, any> ?? {};
  const owner = spec.owner ?? meta.annotations?.['backstage.io/owned-by'] ?? '—';
  const lifecycle = spec.lifecycle as string | undefined;
  const type = spec.type as string | undefined;
  const description = meta.description;

  return (
    <Box className={classes.card}>
      <Tooltip title="Open in Catalog">
        <IconButton
          className={classes.openBtn}
          size="small"
          component="a"
          href={entityUrl(entity)}
        >
          <OpenInNewIcon style={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>

      <div>
        <Link to={entityUrl(entity)} className={classes.cardName}>
          {meta.name}
        </Link>

        {description && (
          <Typography className={classes.description}>{description}</Typography>
        )}
      </div>

      <div className={classes.cardMeta}>
        {type && (
          <Chip
            label={type}
            size="small"
            className={`${classes.chip} ${classes.chipType}`}
          />
        )}
        {lifecycle && (
          <Chip
            label={lifecycle}
            size="small"
            className={`${classes.chip} ${classes[lifecycleColor(lifecycle) as keyof typeof classes]}`}
          />
        )}
        {owner && owner !== '—' && (
          <Chip
            label={typeof owner === 'string' ? owner.replace(/^group:/, '') : owner}
            size="small"
            className={`${classes.chip} ${classes.chipOwner}`}
          />
        )}
      </div>
    </Box>
  );
};

// ─── Section wrapper ──────────────────────────────────────────────────────────

interface SectionConfig {
  title: string;
  icon: React.ReactNode;
  entities: Entity[];
  emptyMessage: string;
  learnMoreHref?: string;
}

const RelationSection: React.FC<SectionConfig> = ({
  title,
  icon,
  entities,
  emptyMessage,
  learnMoreHref,
}) => {
  const classes = useStyles();
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? entities.filter(e =>
        e.metadata.name.toLowerCase().includes(search.toLowerCase()) ||
        (e.metadata.description ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : entities;

  return (
    <Box className={classes.sectionRoot}>
      <Box className={classes.sectionHeader}>
        <Typography className={classes.sectionTitle}>
          <span className={classes.sectionIcon}>{icon}</span>
          {title}
          <span className={classes.countBadge}>{entities.length}</span>
        </Typography>

        {entities.length > 3 && (
          <TextField
            variant="outlined"
            size="small"
            placeholder="Filter…"
            className={classes.searchInput}
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ fontSize: 16 }} />
                </InputAdornment>
              ),
            }}
          />
        )}
      </Box>

      {filtered.length === 0 ? (
        <Box className={classes.emptyBox}>
          {icon}
          <Typography className={classes.emptyText}>
            {search ? 'No results match your filter.' : emptyMessage}
          </Typography>
          {!search && learnMoreHref && (
            <a href={learnMoreHref} className={classes.learnMore}>
              Learn how to change this →
            </a>
          )}
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filtered.map(entity => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={`${entity.kind}:${entity.metadata.namespace}/${entity.metadata.name}`}
            >
              <RelationCard entity={entity} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

// ─── Main exported card ───────────────────────────────────────────────────────

export const GridEntityRelationsCard: React.FC = () => {
  const { entity } = useEntity();

  const { entities: providedApis } = useRelatedEntities(entity, {
    type: RELATION_PROVIDES_API,
  });
  const { entities: consumedApis } = useRelatedEntities(entity, {
    type: RELATION_CONSUMES_API,
  });
  // RELATION_DEPENDS_ON covers both components and resources
  const { entities: dependencies } = useRelatedEntities(entity, {
    type: RELATION_DEPENDS_ON,
  });
  const { entities: subcomponents } = useRelatedEntities(entity, {
    type: RELATION_HAS_PART,
  });

  const dependsOnComponents = (dependencies ?? []).filter(
    e => e.kind.toLowerCase() === 'component',
  );
  const dependsOnResources = (dependencies ?? []).filter(
    e => e.kind.toLowerCase() === 'resource',
  );

  return (
    <InfoCard title="Relations" noPadding>
      <Box p={3}>
        <RelationSection
          title="Provided APIs"
          icon={<ApiIcon />}
          entities={providedApis ?? []}
          emptyMessage="This component does not provide any APIs."
          learnMoreHref="https://backstage.io/docs/features/software-catalog/descriptor-format#specprovidesapis-optional"
        />

        <RelationSection
          title="Consumed APIs"
          icon={<AccountTreeIcon />}
          entities={consumedApis ?? []}
          emptyMessage="This component does not consume any APIs."
          learnMoreHref="https://backstage.io/docs/features/software-catalog/descriptor-format#specconsumesapis-optional"
        />

        <RelationSection
          title="Depends on Components"
          icon={<ExtensionIcon />}
          entities={dependsOnComponents}
          emptyMessage="No component is a dependency of this component."
          learnMoreHref="https://backstage.io/docs/features/software-catalog/descriptor-format#specdependson-optional"
        />

        <RelationSection
          title="Depends on Resources"
          icon={<StorageIcon />}
          entities={dependsOnResources}
          emptyMessage="This component has no resource dependencies."
          learnMoreHref="https://backstage.io/docs/features/software-catalog/descriptor-format#specdependson-optional"
        />

        <RelationSection
          title="Has Subcomponents"
          icon={<ViewModuleIcon />}
          entities={subcomponents ?? []}
          emptyMessage="No subcomponent is part of this component."
          learnMoreHref="https://backstage.io/docs/features/software-catalog/descriptor-format#specsubcomponentof-optional"
        />
      </Box>
    </InfoCard>
  );
};

export default GridEntityRelationsCard;
