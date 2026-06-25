// import React from 'react';
// import { createFrontendModule } from '@backstage/frontend-plugin-api';
// import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';
// import { CatalogGraphWithHide } from '../component/catalog/CatalogGraphWithHide';

// export default createFrontendModule({
//   pluginId: 'catalog-graph',
//   extensions: [
//     EntityCardBlueprint.make({
//       name: 'relations',
//       params: {
//         loader: async () => <CatalogGraphWithHide />,
//       },
//     }),
//   ],
// });


import { createFrontendModule, createExtension, coreExtensionData } from '@backstage/frontend-plugin-api';
import { GraphThemePickerGlobal } from '../components/GraphThemePicker';

/**
 * Attaches GraphThemePickerGlobal to the app root using the low-level
 * createExtension API — no AppRootElementBlueprint import needed.
 *
 * 'app/root' → 'elements' is the same slot that AppRootElementBlueprint
 * targets under the hood, but this works across a wider range of Backstage
 * versions.
 */
const graphThemePickerExtension = createExtension({
  name: 'graph-theme-picker',
  attachTo: { id: 'app/root', input: 'elements' },
  output: [coreExtensionData.reactElement],
  factory() {
    return [coreExtensionData.reactElement(<GraphThemePickerGlobal />)];
  },
});

const catalogGraphModule = createFrontendModule({
  pluginId: 'catalog-graph',
  extensions: [graphThemePickerExtension],
});

export default catalogGraphModule;
