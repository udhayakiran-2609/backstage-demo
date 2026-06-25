import { GraphThemeSettingsCard } from '../components/GraphThemePicker';

/**
 * Standalone settings page — wire into your nav module at
 * path: '/settings/graph-theme'
 */
export function GraphThemeSettingsPage() {  
  return (
    <div style={{ maxWidth: 760, margin: '40px auto', padding: '0 24px', fontFamily: 'inherit' }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px' }}>
          Graph Theme
        </h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
          Choose a colour scheme for the Catalog Graph and entity relations views.
          Your choice is saved to localStorage and applied immediately.
        </p>
      </div>

      <GraphThemeSettingsCard />

      <p style={{ marginTop: 20, fontSize: 12, color: '#475569' }}>
        You can also change the theme any time using the 🎨 floating button
        that appears on catalog and graph pages.
      </p>
    </div>
  );
}
