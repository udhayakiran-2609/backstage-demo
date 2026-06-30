// packages/app/src/components/TopNav/TopNavModule.ts
import React from 'react';
import {
  createFrontendModule,
  AppRootElementBlueprint,
} from '@backstage/frontend-plugin-api';

// Lazy-load so the blueprint gets a React.lazy component (what it expects)
const TopNavBar = React.lazy(() =>
  import('./TopNavBar').then(m => ({ default: m.TopNavBar })),
);

export const topNavModule = createFrontendModule({
  pluginId: 'app',
  extensions: [
    AppRootElementBlueprint.make({
      name: 'top-nav',
      params: { element: React.createElement(TopNavBar) }
    }),
  ],
});