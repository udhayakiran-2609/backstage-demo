import { useState, useEffect, useCallback } from 'react';
import {
  GRAPH_THEMES,
  GRAPH_THEME_STORAGE_KEY,
  DEFAULT_GRAPH_THEME,
  GraphThemeId,
  GraphTheme,
  migrateThemeId,
} from '../theme/graphThemes';

function applyThemeVars(theme: GraphTheme) {
  const root = document.documentElement;
  // Remove all existing --cg-* vars first (clean slate for default theme)
  if (theme.id === 'default') {
    Object.keys(theme.vars).forEach(k => root.style.removeProperty(k));
    return;
  }
  Object.entries(theme.vars).forEach(([k, v]) => {
    root.style.setProperty(k, v);
  });
}

export function useGraphTheme() {
  const [themeId, setThemeIdRaw] = useState<GraphThemeId>(() => {
    // migrateThemeId handles null, legacy IDs, and invalid values safely
    return migrateThemeId(localStorage.getItem(GRAPH_THEME_STORAGE_KEY));
  });

  // Always find the theme — fallback to aurora if somehow still undefined
  const currentTheme: GraphTheme =
    GRAPH_THEMES.find(t => t.id === themeId) ??
    GRAPH_THEMES.find(t => t.id === DEFAULT_GRAPH_THEME)!;

  useEffect(() => {
    applyThemeVars(currentTheme);
    document.documentElement.setAttribute('data-cg-theme', themeId);
  }, [themeId, currentTheme]);

  const setThemeId = useCallback((id: GraphThemeId) => {
    localStorage.setItem(GRAPH_THEME_STORAGE_KEY, id);
    setThemeIdRaw(id);
  }, []);

  return { themeId, setThemeId, currentTheme };
}