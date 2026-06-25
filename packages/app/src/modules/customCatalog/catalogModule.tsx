import {
  createFrontendModule,
  createExtension,
  coreExtensionData,
} from '@backstage/frontend-plugin-api';

import { CustomCatalogPage } from './CustomCatalogPage';

const customCatalogPageExtension = createExtension({
  name: 'custom-catalog-page',

  // temporarily mount at app root
  attachTo: {
    id: 'app/root',
    input: 'elements',
  },

  output: [coreExtensionData.reactElement],

  factory() {
    return [
      coreExtensionData.reactElement(
        <CustomCatalogPage />
      ),
    ];
  },
});

export default createFrontendModule({
  pluginId: 'app',
  extensions: [customCatalogPageExtension],
});