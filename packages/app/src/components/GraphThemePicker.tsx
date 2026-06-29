import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useGraphTheme } from '../hooks/useGraphTheme';
import { GRAPH_THEMES, ENTITY_KIND_LABELS, GraphThemeId } from '../theme/graphThemes';

/* ================================================================
   ROUTE MATCHING — uses includes() to handle base-path prefixes
   e.g. /backstage/catalog/, /app/catalog-graph, etc.
   ================================================================ */
const GRAPH_ROUTE_SEGMENTS = ['catalog/', 'catalog-graph', 'visualizer/tree'];
function isGraphRoute(p: string) {
  return GRAPH_ROUTE_SEGMENTS.some(r => p.includes(r));
}

/* ================================================================
   SVG SELECTOR — tries multiple selectors in order of specificity
   Add more entries here if your production SVG uses a different id/class
   ================================================================ */
const GRAPH_SELECTORS = [
  'svg#dependency-graph',
  'svg.dependency-graph',
  '[data-testid="dependency-graph"] svg',
  '.catalog-graph svg',
  '[class*="graphWrapper"] svg',
  '[class*="graph-wrapper"] svg',
  'svg[class*="graph"]',
];
function findGraphSvg(): Element | null {
  for (const sel of GRAPH_SELECTORS) {
    const el = document.querySelector(sel);
    if (el) return el;
  }
  return null;
}

/* ================================================================
   THEME BUTTON — pill-shaped selector
   ================================================================ */
function ThemeButton({
  label, icon, swatch, active, onClick,
}: {
  id: GraphThemeId; label: string; icon: string;
  swatch: string; active: boolean; onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      aria-pressed={active}
      title={`${label} theme`}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
        fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: active ? 700 : 500,
        border: `1px solid ${active ? swatch : 'rgba(255,255,255,0.15)'}`,
        background: active ? `${swatch}22` : hov ? 'rgba(255,255,255,0.07)' : 'transparent',
        color: active ? swatch : '#e2e8f0',
        boxShadow: active ? `0 0 0 2px ${swatch}44` : 'none',
        transform: hov && !active ? 'translateY(-1px)' : 'none',
        transition: 'all 0.15s ease', outline: 'none',
      }}
    >
      <span style={{ fontSize: 15 }}>{icon}</span>
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: swatch, flexShrink: 0,
        boxShadow: active ? `0 0 8px ${swatch}` : 'none',
      }} />
      {label}
    </button>
  );
}

/* ================================================================
   ENTITY LEGEND — colour dots for each kind
   ================================================================ */
function EntityLegend({ vars }: { vars: Record<string, string> }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      {Object.keys(ENTITY_KIND_LABELS).map(kind => {
        const color = vars[`--cg-node-${kind}`] ?? '#94a3b8';
        return (
          <div key={kind} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontFamily: "'Fira Code', monospace", fontSize: 10,
            fontWeight: 600, color: '#94a3b8',
          }}>
            <span style={{
              width: 9, height: 9, borderRadius: 2, flexShrink: 0,
              background: color, boxShadow: `0 0 5px ${color}88`,
            }} />
            {ENTITY_KIND_LABELS[kind]}
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================
   GRAPH THEME PICKER BAR — used inside both the popup and Settings
   ================================================================ */
export function GraphThemePicker() {
  const { themeId, setThemeId, currentTheme } = useGraphTheme();

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
      padding: '8px 16px',
      background: 'rgba(15,23,42,0.96)',
      borderBottom: `1px solid ${currentTheme.vars['--cg-border']}`,
      backdropFilter: 'blur(12px)',
      minHeight: 44,
      transition: 'background 0.3s ease',
    }}>
      <span style={{
        fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.08em',
        color: '#64748b', marginRight: 4, whiteSpace: 'nowrap',
      }}>
        Graph Theme
      </span>

      {GRAPH_THEMES.map(t => (
        <ThemeButton
          key={t.id} id={t.id} label={t.label}
          icon={t.icon} swatch={t.swatch}
          active={t.id === themeId}
          onClick={() => setThemeId(t.id)}
        />
      ))}

      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 6px', flexShrink: 0 }} />

      <EntityLegend vars={currentTheme.vars} />
    </div>
  );
}

/* ================================================================
   SETTINGS CARD — drop into Settings > Appearance
   ================================================================ */
export function GraphThemeSettingsCard() {
  const { themeId, setThemeId, currentTheme } = useGraphTheme();

  return (
    <div style={{
      border: '1px solid rgba(167,139,250,0.2)',
      borderRadius: 12, overflow: 'hidden', fontFamily: 'inherit',
    }}>
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid rgba(167,139,250,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
            Catalog Graph Theme
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            Controls node and background colours in graph views
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 20,
          border: `1px solid ${currentTheme.swatch}`,
          background: `${currentTheme.swatch}18`,
          fontSize: 12, fontWeight: 600, color: currentTheme.swatch,
        }}>
          <span>{currentTheme.icon}</span> {currentTheme.label}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: 10, padding: 16,
      }}>
        {GRAPH_THEMES.map(t => {
          const active = t.id === themeId;
          return (
            <button key={t.id} onClick={() => setThemeId(t.id)} style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 8, padding: '14px 10px',
              borderRadius: 10, cursor: 'pointer', outline: 'none',
              border: `2px solid ${active ? t.swatch : 'rgba(255,255,255,0.08)'}`,
              background: active ? `${t.swatch}14` : 'rgba(255,255,255,0.03)',
              boxShadow: active ? `0 0 0 3px ${t.swatch}30` : 'none',
              transition: 'all 0.2s ease',
            }}>
              <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', width: 60, justifyContent: 'center' }}>
                {(['--cg-node-component', '--cg-node-api', '--cg-node-system', '--cg-node-domain'] as const)
                  .map((v, i) => (
                    <span key={i} style={{
                      width: 12, height: 12, borderRadius: 3,
                      background: t.vars[v],
                      boxShadow: `0 0 5px ${t.vars[v]}88`,
                    }} />
                  ))}
              </div>
              <div style={{
                fontFamily: "'Fira Code', monospace",
                fontSize: 12, fontWeight: active ? 700 : 500,
                color: active ? t.swatch : '#94a3b8',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span>{t.icon}</span> {t.label}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ padding: '10px 16px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: '#475569', marginBottom: 8,
          fontFamily: "'Fira Code', monospace",
        }}>
          Entity colours in active theme
        </div>
        <EntityLegend vars={currentTheme.vars} />
      </div>
    </div>
  );
}

/* ================================================================
   GLOBAL FLOATING BUTTON  (🎨 top-right of the graph)

   Production fixes applied:
   1. isGraphRoute uses includes() instead of startsWith() to handle base-path prefixes
   2. findGraphSvg() tries multiple selectors in case the SVG id/class differs in prod
   3. Polls up to ~5s (300 rAF frames) before giving up, so late-mounting graphs are found
   4. Skips zero-size rects (element in DOM but not yet laid out)
   5. Falls back to a fixed corner position if SVG is never found
   6. Renders the FAB on any graph route regardless of whether rect is resolved yet
   ================================================================ */
export function GraphThemePickerGlobal() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ top: number; bottom: number; right: number } | null>(null);
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });
  const { currentTheme, themeId, setThemeId } = useGraphTheme();
  const cssLoadedRef = useRef(false);

  // Track viewport size for panel clamping
  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Apply theme attribute + lazy-load CSS
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-cg-theme', themeId);
    if (themeId === 'default') return;
    if (!cssLoadedRef.current) {
      import('../styles/catalogGraphTheme.css')
        .then(() => { cssLoadedRef.current = true; })
        .catch(err => console.error('Failed to load catalogGraphTheme.css', err));
    }
  }, [themeId]);

  // Poll for the graph SVG and track its position
  useEffect(() => {
    if (!isGraphRoute(location.pathname)) {
      setOpen(false);
      setRect(null);
      return;
    }

    let raf = 0;
    let cancelled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 300; // ~5s at 60fps — enough for slow graph renders

    const measure = () => {
      if (cancelled) return;
      attempts++;

      const el = findGraphSvg();

      if (el) {
        const r = el.getBoundingClientRect();

        // Skip zero-size rects: element is in DOM but not laid out yet
        if (r.width === 0 && r.height === 0) {
          if (attempts < MAX_ATTEMPTS) raf = requestAnimationFrame(measure);
          return;
        }

        setRect(prev => {
          const next = {
            top: r.top + 12,
            bottom: r.top + 12 + 36,
            right: window.innerWidth - r.right + 12,
          };
          // Skip update if position hasn't meaningfully changed (avoid render churn)
          if (
            prev &&
            Math.abs(prev.top - next.top) < 1 &&
            Math.abs(prev.right - next.right) < 1
          ) return prev;
          return next;
        });

        // Keep polling so the FAB tracks if the SVG repositions
        raf = requestAnimationFrame(measure);
      } else {
        // SVG not found yet — keep trying
        if (attempts < MAX_ATTEMPTS) {
          raf = requestAnimationFrame(measure);
        } else {
          // Fallback: show FAB in a fixed top-right corner so it's always accessible
          setRect({ top: 72, bottom: 108, right: 16 });
        }
      }
    };

    raf = requestAnimationFrame(measure);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [location.pathname]);

  // Don't render on non-graph routes
  if (!isGraphRoute(location.pathname)) return null;

  // Use resolved rect or a safe default — FAB always shows on graph routes
  const safeRect = rect ?? { top: 72, bottom: 108, right: 16 };

  const BUTTON_SIZE = 36;
  const GAP = 8;
  const PANEL_WIDTH = Math.min(viewport.w - 24, 340);

  const fabTop = safeRect.top;
  const fabBottom = safeRect.top + BUTTON_SIZE;
  const spaceBelow = viewport.h - fabBottom - GAP - 16;
  const spaceAbove = fabTop - GAP - 16;

  const openUp = spaceBelow < 280 && spaceAbove > spaceBelow;

  // Clamp panel so it never clips off the left edge
  const rightOffset = Math.min(safeRect.right, viewport.w - PANEL_WIDTH - 12);

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    right: rightOffset - 10,
    zIndex: 1000,
    display: 'flex',
    flexDirection: openUp ? 'column-reverse' : 'column',
    alignItems: 'flex-end',
    gap: GAP,
    transition: 'top 0.15s ease, bottom 0.15s ease, right 0.15s ease',
    ...(openUp
      ? { bottom: viewport.h - fabBottom }
      : { top: fabTop }),
  };

  const content = (
    <div style={containerStyle}>
      {/* FAB toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        title="Change graph theme"
        style={{
          width: BUTTON_SIZE, height: BUTTON_SIZE, borderRadius: '50%', border: 'none',
          background: open ? currentTheme.swatch : '#1a1f2e',
          color: open ? '#0f172a' : currentTheme.swatch,
          fontSize: 18, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 2px 10px rgba(0,0,0,0.35)`,
          transition: 'background 0.15s ease, color 0.15s ease',
          flexShrink: 0,
        }}
      >
        🎨
      </button>

      {/* Picker panel */}
      {open && (
        <div style={{
          background: '#161b29',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10,
          boxShadow: '0 8px 28px rgba(0,0,0,0.4)',
          width: PANEL_WIDTH,
          maxHeight: Math.max(160, openUp ? spaceAbove : spaceBelow),
          display: 'flex',
          flexDirection: 'column',
          animation: openUp ? 'cgPickerInUp 0.15s ease' : 'cgPickerIn 0.15s ease',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 14px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb' }}>
              Graph theme
            </span>
            <button onClick={() => setOpen(false)} style={{
              background: 'transparent', border: 'none',
              color: '#6b7280', cursor: 'pointer', fontSize: 14,
              width: 22, height: 22, lineHeight: 1, flexShrink: 0,
            }}>✕</button>
          </div>

          {/* Scrollable content */}
          <div style={{ overflowY: 'auto', minHeight: 0 }}>
            {/* Theme swatch grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
              gap: 6, padding: 12,
            }}>
              {GRAPH_THEMES.map(t => {
                const active = t.id === themeId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setThemeId(t.id)}
                    aria-pressed={active}
                    title={`${t.label} theme`}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                      padding: '10px 6px', borderRadius: 8, cursor: 'pointer', outline: 'none',
                      border: active ? `1px solid ${t.swatch}` : '1px solid rgba(255,255,255,0.06)',
                      background: active ? `${t.swatch}14` : 'transparent',
                      transition: 'background 0.12s ease, border-color 0.12s ease',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 3 }}>
                      {(t.id === 'default'
                        ? ['#9ca3af', '#6b7280', '#4b5563', '#d1d5db']
                        : (['--cg-node-component', '--cg-node-api', '--cg-node-system', '--cg-node-domain'] as const)
                            .map(v => t.vars[v]))
                        .map((c, i) => (
                          <span key={i} style={{
                            width: 9, height: 9, borderRadius: 2, background: c,
                          }} />
                        ))}
                    </div>
                    <div style={{
                      fontSize: 11, fontWeight: active ? 600 : 400,
                      color: active ? '#e5e7eb' : '#9ca3af',
                    }}>
                      {t.label}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Entity legend — hidden for Default */}
            {themeId !== 'default' && (
              <div style={{
                padding: '10px 14px 12px',
                borderTop: '1px solid rgba(255,255,255,0.07)',
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 600, color: '#6b7280', marginBottom: 6,
                }}>
                  Entity colours
                </div>
                <EntityLegend vars={currentTheme.vars} />
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes cgPickerIn {
          from { opacity:0; transform: translateY(-6px); }
          to   { opacity:1; transform: translateY(0); }
        }
        @keyframes cgPickerInUp {
          from { opacity:0; transform: translateY(6px); }
          to   { opacity:1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );

  return createPortal(content, document.body);
}
