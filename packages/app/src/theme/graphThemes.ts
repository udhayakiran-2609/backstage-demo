export type GraphThemeId =
  | 'default'
  | 'aurora'
  | 'sakura'
  | 'arctic'
  | 'ember'
  | 'midnight'
  | 'matcha'
  | 'neon';

export const DEFAULT_GRAPH_THEME: GraphThemeId = 'aurora';
export const GRAPH_THEME_STORAGE_KEY = 'backstage-graph-theme';

const VALID_THEME_IDS: GraphThemeId[] = ['default','aurora','sakura','arctic','ember','midnight','matcha','neon'];

/**
 * Maps any legacy theme ID (from previous builds) to a valid current ID.
 * Call this when reading from localStorage before using the value.
 */
export function migrateThemeId(raw: string | null): GraphThemeId {
  const LEGACY_MAP: Record<string, GraphThemeId> = {
    Default:  'default',
    cosmic:   'aurora',
    forest:   'matcha',
    ocean:    'arctic',
    sunset:   'ember',
    dracula:  'midnight',
    mono:     'default',
  };
  if (!raw) return DEFAULT_GRAPH_THEME;
  if (raw in LEGACY_MAP) return LEGACY_MAP[raw];
  return (VALID_THEME_IDS as string[]).includes(raw) ? (raw as GraphThemeId) : DEFAULT_GRAPH_THEME;
}

export interface GraphThemeVars {
  // Backgrounds
  '--cg-bg-start': string;
  '--cg-bg-mid': string;
  '--cg-bg-end': string;
  '--cg-surface': string;
  '--cg-surface-alt': string;
  '--cg-border': string;
  // Text
  '--cg-text': string;
  '--cg-text-secondary': string;
  // Entity-kind node stroke + glow colours
  '--cg-node-component': string;
  '--cg-node-api': string;
  '--cg-node-system': string;
  '--cg-node-domain': string;
  '--cg-node-resource': string;
  '--cg-node-group': string;
  '--cg-node-user': string;
  '--cg-node-default': string;
  // Edge colours per relation type
  '--cg-edge-provides': string;
  '--cg-edge-consumes': string;
  '--cg-edge-owns': string;
  '--cg-edge-dependsOn': string;
  '--cg-edge-default': string;
}

export interface GraphTheme {
  id: GraphThemeId;
  label: string;
  icon: string;
  swatch: string;
  vars: GraphThemeVars;
}

export const GRAPH_THEMES: GraphTheme[] = [
  {
    id: 'default',
    label: 'Default',
    icon: '⚙️',
    swatch: '#94a3b8',
    vars: {} as GraphThemeVars,  // Default theme is defined purely in CSS; vars intentionally empty
  },

  // ── LIGHT THEMES ──────────────────────────────────────────────────────────

  {
    // Soft pastel light — airy sky & blossom palette
    id: 'sakura',
    label: 'Sakura',
    icon: '🌸',
    swatch: '#f472b6',
    vars: {
      '--cg-bg-start':      '#fdf2f8',
      '--cg-bg-mid':        '#fce7f3',
      '--cg-bg-end':        '#ede9fe',
      '--cg-surface':       'rgba(255,255,255,0.92)',
      '--cg-surface-alt':   'rgba(253,242,248,0.88)',
      '--cg-border':        'rgba(244,114,182,0.30)',
      '--cg-text':          '#1e1b2e',
      '--cg-text-secondary':'#6d5080',
      '--cg-node-component':'#db2777',
      '--cg-node-api':      '#7c3aed',
      '--cg-node-system':   '#0ea5e9',
      '--cg-node-domain':   '#d97706',
      '--cg-node-resource': '#059669',
      '--cg-node-group':    '#ea580c',
      '--cg-node-user':     '#be185d',
      '--cg-node-default':  '#78716c',
      '--cg-edge-provides': '#10b981',
      '--cg-edge-consumes': '#ef4444',
      '--cg-edge-owns':     '#db2777',
      '--cg-edge-dependsOn':'#f59e0b',
      '--cg-edge-default':  'rgba(167,114,182,0.40)',
    },
  },

  {
    // Clean arctic white — professional & calm
    id: 'arctic',
    label: 'Arctic',
    icon: '🧊',
    swatch: '#0ea5e9',
    vars: {
      '--cg-bg-start':      '#f0f9ff',
      '--cg-bg-mid':        '#e0f2fe',
      '--cg-bg-end':        '#f8fafc',
      '--cg-surface':       'rgba(255,255,255,0.95)',
      '--cg-surface-alt':   'rgba(240,249,255,0.90)',
      '--cg-border':        'rgba(14,165,233,0.25)',
      '--cg-text':          '#0c1a27',
      '--cg-text-secondary':'#475569',
      '--cg-node-component':'#0369a1',
      '--cg-node-api':      '#7c3aed',
      '--cg-node-system':   '#0891b2',
      '--cg-node-domain':   '#b45309',
      '--cg-node-resource': '#047857',
      '--cg-node-group':    '#c2410c',
      '--cg-node-user':     '#1d4ed8',
      '--cg-node-default':  '#64748b',
      '--cg-edge-provides': '#059669',
      '--cg-edge-consumes': '#dc2626',
      '--cg-edge-owns':     '#0369a1',
      '--cg-edge-dependsOn':'#d97706',
      '--cg-edge-default':  'rgba(14,165,233,0.35)',
    },
  },

  // ── MID / VIBRANT THEMES ──────────────────────────────────────────────────

  {
    // Warm ember — terracotta + gold on a creamy warm dark
    id: 'ember',
    label: 'Ember',
    icon: '🔥',
    swatch: '#f97316',
    vars: {
      '--cg-bg-start':      '#1c1007',
      '--cg-bg-mid':        '#2d1a0a',
      '--cg-bg-end':        '#1a120c',
      '--cg-surface':       'rgba(28,16,7,0.96)',
      '--cg-surface-alt':   'rgba(45,26,10,0.90)',
      '--cg-border':        'rgba(251,146,60,0.28)',
      '--cg-text':          '#fef3c7',
      '--cg-text-secondary':'#fcd34d',
      '--cg-node-component':'#fb923c',
      '--cg-node-api':      '#fbbf24',
      '--cg-node-system':   '#f87171',
      '--cg-node-domain':   '#a3e635',
      '--cg-node-resource': '#34d399',
      '--cg-node-group':    '#e879f9',
      '--cg-node-user':     '#38bdf8',
      '--cg-node-default':  '#a8a29e',
      '--cg-edge-provides': '#4ade80',
      '--cg-edge-consumes': '#f87171',
      '--cg-edge-owns':     '#fb923c',
      '--cg-edge-dependsOn':'#fbbf24',
      '--cg-edge-default':  'rgba(251,146,60,0.40)',
    },
  },

  {
    // Matcha — earthy green-gold, mid-dark, zen
    id: 'matcha',
    label: 'Matcha',
    icon: '🍵',
    swatch: '#84cc16',
    vars: {
      '--cg-bg-start':      '#0f1a0d',
      '--cg-bg-mid':        '#1a2e16',
      '--cg-bg-end':        '#111f10',
      '--cg-surface':       'rgba(14,24,12,0.96)',
      '--cg-surface-alt':   'rgba(24,42,20,0.90)',
      '--cg-border':        'rgba(132,204,22,0.26)',
      '--cg-text':          '#f7fee7',
      '--cg-text-secondary':'#bef264',
      '--cg-node-component':'#84cc16',
      '--cg-node-api':      '#22d3ee',
      '--cg-node-system':   '#facc15',
      '--cg-node-domain':   '#fb923c',
      '--cg-node-resource': '#4ade80',
      '--cg-node-group':    '#f472b6',
      '--cg-node-user':     '#a78bfa',
      '--cg-node-default':  '#6b7280',
      '--cg-edge-provides': '#4ade80',
      '--cg-edge-consumes': '#f87171',
      '--cg-edge-owns':     '#84cc16',
      '--cg-edge-dependsOn':'#facc15',
      '--cg-edge-default':  'rgba(132,204,22,0.35)',
    },
  },

  // ── DARK THEMES ───────────────────────────────────────────────────────────

  {
    // Deep midnight blue — ultra polished dark
    id: 'midnight',
    label: 'Midnight',
    icon: '🌙',
    swatch: '#818cf8',
    vars: {
      '--cg-bg-start':      '#060811',
      '--cg-bg-mid':        '#0d1117',
      '--cg-bg-end':        '#080c18',
      '--cg-surface':       'rgba(6,8,17,0.97)',
      '--cg-surface-alt':   'rgba(13,17,23,0.93)',
      '--cg-border':        'rgba(129,140,248,0.20)',
      '--cg-text':          '#e2e8f0',
      '--cg-text-secondary':'#64748b',
      '--cg-node-component':'#818cf8',
      '--cg-node-api':      '#f472b6',
      '--cg-node-system':   '#38bdf8',
      '--cg-node-domain':   '#fbbf24',
      '--cg-node-resource': '#34d399',
      '--cg-node-group':    '#fb923c',
      '--cg-node-user':     '#e879f9',
      '--cg-node-default':  '#475569',
      '--cg-edge-provides': '#34d399',
      '--cg-edge-consumes': '#f87171',
      '--cg-edge-owns':     '#818cf8',
      '--cg-edge-dependsOn':'#fbbf24',
      '--cg-edge-default':  'rgba(129,140,248,0.30)',
    },
  },

  {
    // Aurora borealis — electric teal/green on deep black
    id: 'aurora',
    label: 'Aurora',
    icon: '🌌',
    swatch: '#2dd4bf',
    vars: {
      '--cg-bg-start':      '#020d0b',
      '--cg-bg-mid':        '#051a15',
      '--cg-bg-end':        '#031210',
      '--cg-surface':       'rgba(2,13,11,0.97)',
      '--cg-surface-alt':   'rgba(5,26,21,0.93)',
      '--cg-border':        'rgba(45,212,191,0.22)',
      '--cg-text':          '#ccfbf1',
      '--cg-text-secondary':'#5eead4',
      '--cg-node-component':'#2dd4bf',
      '--cg-node-api':      '#a78bfa',
      '--cg-node-system':   '#34d399',
      '--cg-node-domain':   '#facc15',
      '--cg-node-resource': '#67e8f9',
      '--cg-node-group':    '#f472b6',
      '--cg-node-user':     '#86efac',
      '--cg-node-default':  '#6b7280',
      '--cg-edge-provides': '#34d399',
      '--cg-edge-consumes': '#f87171',
      '--cg-edge-owns':     '#2dd4bf',
      '--cg-edge-dependsOn':'#facc15',
      '--cg-edge-default':  'rgba(45,212,191,0.35)',
    },
  },

  {
    // Neon city — high-contrast cyberpunk
    id: 'neon',
    label: 'Neon',
    icon: '⚡',
    swatch: '#f0abfc',
    vars: {
      '--cg-bg-start':      '#09000f',
      '--cg-bg-mid':        '#0f0020',
      '--cg-bg-end':        '#080012',
      '--cg-surface':       'rgba(9,0,15,0.97)',
      '--cg-surface-alt':   'rgba(15,0,32,0.92)',
      '--cg-border':        'rgba(240,171,252,0.28)',
      '--cg-text':          '#fae8ff',
      '--cg-text-secondary':'#d946ef',
      '--cg-node-component':'#f0abfc',
      '--cg-node-api':      '#67e8f9',
      '--cg-node-system':   '#a3e635',
      '--cg-node-domain':   '#fbbf24',
      '--cg-node-resource': '#4ade80',
      '--cg-node-group':    '#fb923c',
      '--cg-node-user':     '#f87171',
      '--cg-node-default':  '#6b21a8',
      '--cg-edge-provides': '#4ade80',
      '--cg-edge-consumes': '#f87171',
      '--cg-edge-owns':     '#f0abfc',
      '--cg-edge-dependsOn':'#fbbf24',
      '--cg-edge-default':  'rgba(240,171,252,0.38)',
    },
  },
];

export const ENTITY_KIND_LABELS: Record<string, string> = {
  component: 'Component',
  api:       'API',
  system:    'System',
  domain:    'Domain',
  resource:  'Resource',
  group:     'Group',
  user:      'User',
};