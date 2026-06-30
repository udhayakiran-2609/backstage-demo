import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Dialog,
  DialogContent,
  InputBase,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Chip,
  CircularProgress,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import DescriptionIcon from '@material-ui/icons/Description';
import MemoryIcon from '@material-ui/icons/Memory';
import PeopleIcon from '@material-ui/icons/People';
import CodeIcon from '@material-ui/icons/Code';
import {
  useSearch,
  SearchContextProvider,
} from '@backstage/plugin-search-react';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles(_theme => ({
  dialog: {
    '& .MuiDialog-paper': {
      borderRadius: 14,
      maxWidth: 640,
      width: '100%',
      marginTop: '8vh',
      verticalAlign: 'top',
      boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
      overflow: 'visible',
    },
    '& .MuiBackdrop-root': {
      backgroundColor: 'rgba(0,0,0,0.35)',
      backdropFilter: 'blur(2px)',
    },
  },
  dialogContent: {
    padding: 0,
    overflow: 'visible',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    gap: 10,
  },
  searchIcon: {
    color: '#6b7280',
    fontSize: 20,
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: 400,
    '& input': {
      padding: 0,
      '&::placeholder': {
        color: '#9ca3af',
      },
    },
  },
  kbdHint: {
    fontSize: 12,
    color: '#9ca3af',
    border: '1px solid #e5e7eb',
    borderRadius: 4,
    padding: '2px 6px',
    fontFamily: 'monospace',
    backgroundColor: '#f9fafb',
  },
  divider: {
    backgroundColor: '#f3f4f6',
  },
  filterChips: {
    display: 'flex',
    gap: 6,
    padding: '8px 16px',
    flexWrap: 'wrap' as const,
  },
  chip: {
    fontSize: 12,
    height: 26,
    borderRadius: 6,
    border: '1px solid #e5e7eb',
    color: '#374151',
    backgroundColor: '#f9fafb',
    '&:hover': {
      backgroundColor: '#f0f4ff',
      borderColor: '#93c5fd',
    },
  },
  chipActive: {
    backgroundColor: '#eff6ff !important',
    borderColor: '#3b82f6 !important',
    color: '#1d4ed8 !important',
    fontWeight: 600,
  },
  resultsContainer: {
    maxHeight: 380,
    overflow: 'auto',
    padding: '4px 0',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    padding: '8px 16px 4px',
  },
  resultItem: {
    padding: '8px 16px',
    cursor: 'pointer',
    borderRadius: 8,
    margin: '0 6px',
    '&:hover': {
      backgroundColor: '#f0f4ff',
    },
  },
  resultIcon: {
    minWidth: 32,
    color: '#6b7280',
  },
  resultPrimary: {
    fontSize: 14,
    fontWeight: 500,
    color: '#111827',
  },
  resultSecondary: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    padding: '32px 16px',
    textAlign: 'center' as const,
    color: '#9ca3af',
    fontSize: 14,
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    padding: 20,
  },
  footer: {
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    borderTop: '1px solid #f3f4f6',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
}));

const typeIconMap: Record<string, React.ReactNode> = {
  'software-catalog': <MemoryIcon style={{ fontSize: 17 }} />,
  techdocs: <DescriptionIcon style={{ fontSize: 17 }} />,
  user: <PeopleIcon style={{ fontSize: 17 }} />,
  group: <PeopleIcon style={{ fontSize: 17 }} />,
  api: <CodeIcon style={{ fontSize: 17 }} />,
};

const FILTER_TYPES = [
  { label: 'All', value: '' },
  { label: 'Services', value: 'software-catalog' },
  { label: 'Docs', value: 'techdocs' },
  { label: 'People', value: 'user' },
  { label: 'APIs', value: 'api' },
];

const SearchModalInner = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeFilter, setActiveFilter] = useState('');

  // useSearch() returns the full SearchContextValue:
  //   { term, setTerm, types, setTypes, filters, setFilters, result, loading, error, ... }
  // "result" is SearchResultSet | undefined — it has a .results array on it directly.
  // "loading" is a plain boolean on the context value itself (not inside result).
  const searchContext = useSearch();
  const term: string = searchContext.term;
  const setTerm: (t: string) => void = searchContext.setTerm;

  // result is SearchResultSet | undefined  →  { results: SearchResult[] }
  // Cast to any to avoid version-specific type drift
  const resultSet = (searchContext as any).result as
    | { results: any[] }
    | undefined;

  // loading lives directly on context in newer versions;
  // fall back gracefully if your version doesn't expose it
  const isLoading: boolean =
    typeof (searchContext as any).loading === 'boolean'
      ? (searchContext as any).loading
      : false;

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setTerm('');
      setActiveFilter('');
    }
  }, [open, setTerm]);

  // ESC closes modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const results: any[] = resultSet?.results ?? [];
  const filtered = activeFilter
    ? results.filter((r: any) => r.type === activeFilter)
    : results;

  const handleResultClick = (doc: any) => {
    onClose();
    if (doc.location) navigate(doc.location);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={classes.dialog}
      fullWidth
      maxWidth="sm"
      TransitionProps={{ timeout: 150 }}
    >
      <DialogContent className={classes.dialogContent}>
        {/* Search Input */}
        <div className={classes.searchBar}>
          <SearchIcon className={classes.searchIcon} />
          <InputBase
            inputRef={inputRef}
            className={classes.input}
            placeholder="Search for services, docs, people, repositories..."
            value={term}
            onChange={e => setTerm(e.target.value)}
            fullWidth
          />
          <span className={classes.kbdHint}>ESC</span>
        </div>

        {/* Filter chips */}
        <div className={classes.filterChips}>
          {FILTER_TYPES.map(f => (
            <Chip
              key={f.value || 'all'}
              label={f.label}
              size="small"
              variant="outlined"
              className={`${classes.chip} ${
                activeFilter === f.value ? classes.chipActive : ''
              }`}
              onClick={() => setActiveFilter(f.value)}
              clickable
            />
          ))}
        </div>

        <Divider className={classes.divider} />

        {/* Results */}
        <div className={classes.resultsContainer}>
          {isLoading ? (
            <div className={classes.loading}>
              <CircularProgress size={24} />
            </div>
          ) : term && filtered.length === 0 ? (
            <div className={classes.emptyState}>
              No results found for "<strong>{term}</strong>"
            </div>
          ) : filtered.length > 0 ? (
            <>
              {term && (
                <Typography className={classes.sectionLabel}>Results</Typography>
              )}
              <List disablePadding>
                {filtered.map((r: any, i: number) => (
                  <ListItem
                    key={i}
                    className={classes.resultItem}
                    onClick={() => handleResultClick(r.document)}
                    button
                  >
                    <ListItemIcon className={classes.resultIcon}>
                      {typeIconMap[r.type] ?? (
                        <SearchIcon style={{ fontSize: 17 }} />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <span className={classes.resultPrimary}>
                          {r.document.title ?? r.document.name}
                        </span>
                      }
                      secondary={
                        <span className={classes.resultSecondary}>
                          {r.document.text?.slice(0, 80) ??
                            r.document.kind ??
                            ''}
                        </span>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </>
          ) : (
            <div className={classes.emptyState}>
              Start typing to search across all of Backstage
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={classes.footer}>
          <span className={classes.kbdHint}>↑↓</span>
          <span className={classes.footerText}>navigate</span>
          <span className={classes.kbdHint}>↵</span>
          <span className={classes.footerText}>select</span>
          <span className={classes.kbdHint}>ESC</span>
          <span className={classes.footerText}>close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SearchModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  return (
    <SearchContextProvider>
      <SearchModalInner open={open} onClose={onClose} />
    </SearchContextProvider>
  );
};

export default SearchModal;
