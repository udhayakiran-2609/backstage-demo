import { createFrontendModule } from '@backstage/frontend-plugin-api';

/**
 * Graph Visualization Module
 * 
 * Provides enhanced catalog graph visualization with theme support
 */
export const graphVisualizationModule = createFrontendModule({
  pluginId: 'app',
  extensions: [],
});

// Color scheme definitions for graph visualization
export const GRAPH_THEMES = {
  darkNord: {
    background: '#0f172a',
    primary: '#3b82f6',
    secondary: '#1e293b',
    accent: '#60a5fa',
    nodeComponent: '#6366f1',
    nodeAPI: '#06b6d4',
    nodeSystem: '#f97316',
    edge: '#475569',
  },
  cyberpunk: {
    background: '#0a0e27',
    primary: '#00ff00',
    secondary: '#1a1a2e',
    accent: '#00d9ff',
    nodeComponent: '#ff006e',
    nodeAPI: '#00ff00',
    nodeSystem: '#00d9ff',
    edge: '#ffbe0b',
  },
  solarized: {
    background: '#002b36',
    primary: '#268bd2',
    secondary: '#073642',
    accent: '#2aa198',
    nodeComponent: '#d33682',
    nodeAPI: '#268bd2',
    nodeSystem: '#859900',
    edge: '#586e75',
  },
  github: {
    background: '#ffffff',
    primary: '#1f6feb',
    secondary: '#f6f8fa',
    accent: '#0969da',
    nodeComponent: '#0969da',
    nodeAPI: '#1f6feb',
    nodeSystem: '#3fb950',
    edge: '#d0d7de',
  },
};

/**
 * Apply theme to graph
 */
export function applyGraphTheme(themeName: keyof typeof GRAPH_THEMES) {
  const theme = GRAPH_THEMES[themeName];
  if (!theme) return;

  const styleId = `graph-theme-${themeName}`;
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) existingStyle.remove();

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    svg#dependency-graph {
      background: ${theme.background} !important;
    }
    svg#dependency-graph g[data-testid="node"] rect {
      fill: ${theme.primary} !important;
      stroke: ${theme.accent} !important;
    }
    svg#dependency-graph path[data-testid="edge"] {
      stroke: ${theme.edge} !important;
    }
  `;
  document.head.appendChild(style);
}
