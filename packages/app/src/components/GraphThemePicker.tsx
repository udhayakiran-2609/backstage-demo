import React, { useState, useEffect, useRef } from 'react';          // ← proper import, not require()
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useGraphTheme } from '../hooks/useGraphTheme';
import { GRAPH_THEMES, ENTITY_KIND_LABELS, GraphThemeId } from '../theme/graphThemes';

// Pages where the floating button appears
const GRAPH_ROUTES = ['/catalog/', '/catalog-graph','/visualizer/tree'];
function isGraphRoute(p: string) {
  return GRAPH_ROUTES.some(r => p.startsWith(r));
}

// The graph element we anchor the picker to. We target the SVG itself
// (id="dependency-graph") rather than a wrapper class name, since plugin
// class names get hashed/renamed across Backstage versions and builds —
// the SVG id is stable and is always the actual rendered graph surface.
const GRAPH_SELECTOR = 'svg#dependency-graph';

/* ================================================================
   THEME BUTTON — pill-shaped selector
   ================================================================ */
function ThemeButton({
  id, label, icon, swatch, active, onClick,
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
   <GraphThemeSettingsCard /> renders a full theme selector grid
   ================================================================ */
export function GraphThemeSettingsCard() {
  const { themeId, setThemeId, currentTheme } = useGraphTheme();

  return (
    <div style={{
      border: '1px solid rgba(167,139,250,0.2)',
      borderRadius: 12, overflow: 'hidden', fontFamily: 'inherit',
    }}>
      {/* Header */}
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

      {/* Theme grid */}
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
              {/* Mini colour swatches */}
              <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', width: 60, justifyContent: 'center' }}>
                {(['--cg-node-component','--cg-node-api','--cg-node-system','--cg-node-domain'] as const)
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

      {/* Entity legend footer */}
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
   - Mounts via createPortal directly into the graph wrapper element,
     so it scrolls and positions with the graph instead of the viewport.
   - Falls back to a fixed top-right viewport position if the wrapper
     hasn't mounted yet (e.g. while the graph is still loading).
   - Visible on all /catalog* and /catalog-graph pages
   - Click toggles a picker panel below the button
   ================================================================ */
export function GraphThemePickerGlobal() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  // Screen-space rect of the actual graph SVG, recomputed continuously.
  // null while the graph hasn't rendered yet (e.g. still loading).
  const [rect, setRect] = useState<{ top: number; right: number } | null>(null);
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const { currentTheme, themeId, setThemeId } = useGraphTheme(); // applies CSS vars on mount

  // Gate catalog-graph-theme.css behind this attribute, AND dynamically
  // import the CSS module itself rather than relying on a static import in
  // App.tsx. Runs on every themeId change — including the very first run
  // after a reload, so if the user's persisted theme is non-default, the
  // CSS loads immediately rather than waiting for them to touch the
  // picker again. Dynamic import is idempotent/cached by the bundler, so
  // switching back and forth between non-default themes doesn't refetch.
  const cssLoadedRef = useRef(false);
  useEffect(() => {
    const html = document.documentElement;

    // IMPORTANT: always set the attribute, never remove it. The CSS gate
    // is `html:not([data-cg-theme="default"])` — that selector matches
    // whenever the attribute ISN'T exactly "default", and an *absent*
    // attribute also isn't "default", so removeAttribute() was actually
    // making the gate match (true) instead of shutting it off. Setting
    // the literal value "default" is what makes :not() correctly fail to
    // match and reverts to native Backstage styling.
    html.setAttribute('data-cg-theme', themeId);

    if (themeId === 'default') return;

    if (!cssLoadedRef.current) {
      import('../styles/catalogGraphTheme.css')
        .then(() => {
          cssLoadedRef.current = true;
        })
        .catch(err => {
          // eslint-disable-next-line no-console
          console.error('Failed to load catalogGraphTheme.css', err);
        });
    }
  }, [themeId]);

  useEffect(() => {
    if (!isGraphRoute(location.pathname)) {
      setOpen(false);
      setRect(null);
      return;
    }

    let raf = 0;
    let cancelled = false;

    const measure = () => {
      if (cancelled) return;
      const el = document.querySelector(GRAPH_SELECTOR) as HTMLElement | SVGElement | null;
      if (el) {
        const r = (el as Element).getBoundingClientRect();
        // Only update state when the position actually moved by a
        // meaningful amount, to avoid re-rendering every frame.
        setRect(prev => {
          const next = { top: r.top + 12, right: window.innerWidth - r.right + 12 };
          if (prev && Math.abs(prev.top - next.top) < 1 && Math.abs(prev.right - next.right) < 1) {
            return prev;
          }
          return next;
        });
      } else {
        setRect(prev => (prev === null ? prev : null));
      }
      raf = requestAnimationFrame(measure);
    };
    raf = requestAnimationFrame(measure);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [location.pathname]);

  if (!isGraphRoute(location.pathname)) return null;
  // Don't show the button at all until the graph has actually rendered —
  // previously this fell back to a fixed top-right-of-viewport position,
  // which made it appear floating over the page before/while the graph
  // was still loading. Now it simply waits.
  if (!rect) return null;

  const BUTTON_SIZE = 36;
  const GAP = 8;
  const PANEL_WIDTH = Math.min(viewport.w - 24, 340);

  // Decide whether the panel opens below or above the button, and
  // constrain its height to whatever room is actually available — this
  // is what was getting clipped/hidden before: a fixed-height panel could
  // run past the bottom (or top) of the window with no way to scroll to
  // the rest of it.
  const spaceBelow = viewport.h - (rect.top + BUTTON_SIZE) - GAP - 16;
  const spaceAbove = rect.top - GAP - 16;
  const openUp = spaceBelow < 280 && spaceAbove > spaceBelow;
  const maxPanelHeight = Math.max(160, openUp ? spaceAbove : spaceBelow);

  // Clamp horizontally so the panel never runs off the left edge on
  // narrow windows, regardless of how far right the button itself sits.
  const rightOffset = Math.min(rect.right, viewport.w - PANEL_WIDTH - 12);

  const containerStyle: React.CSSProperties = {
    position: 'fixed', top: rect.top - 55, right: rightOffset - 10, zIndex: 1000,
    display: 'flex', flexDirection: openUp ? 'column-reverse' : 'column',
    alignItems: 'flex-end', gap: GAP,
    transition: 'top 0.15s ease, right 0.15s ease',
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

          {/* Scrollable content — this is what was getting cut off when
              the panel ran out of vertical room before */}
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

            {/* Entity legend — hidden for Default, since native Backstage
                graph styling doesn't use these colours */}
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
