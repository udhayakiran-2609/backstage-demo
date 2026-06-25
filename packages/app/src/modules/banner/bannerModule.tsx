import {
  createFrontendModule,
  AppRootElementBlueprint,
} from '@backstage/frontend-plugin-api';
import { BannerProvider } from '../../components/Banner/BannerProvider';

/**
 * AppRootElementBlueprint expects `params.element` — a JSX element rendered
 * directly, NOT a lazy loader function. The element is attached to
 * "app/root" → "elements" input and mounted above every page.
 */
const bannerRootElement = AppRootElementBlueprint.make({
  name: 'release-banner',
  params: {
    element: <BannerProvider />,    
  },
});

export const bannerModule = createFrontendModule({
  pluginId: 'app',
  extensions: [bannerRootElement],
});



// import React from 'react';
// import {
//   createFrontendModule,
//   PluginWrapperBlueprint,
// } from '@backstage/frontend-plugin-api';
// import { BannerWrapper } from './BannerWrapper';

// /**
//  * bannerModule registers the per-plugin empty-state banner wrapper.
//  *
//  * The global banner is NOT here — add <GlobalBannerBar /> to your App.tsx
//  * layout so it renders exactly once per page.
//  *
//  * Add to App.tsx features[]:
//  *   import { bannerModule } from './modules/banner/bannerModule';
//  *   features: [ ..., bannerModule ]
//  */
// const bannerWrapper = PluginWrapperBlueprint.make({
//   name: 'banner-wrapper',
//   params: defineParams =>
//     defineParams({
//       loader: async () => ({
//         component: ({ children }: { children: React.ReactNode; value: never }) => (
//           <BannerWrapper>{children}</BannerWrapper>
//         ),
//       }),
//     }),
// });

// export const bannerModule = createFrontendModule({
//   pluginId: 'app',
//   extensions: [bannerWrapper],
// });
