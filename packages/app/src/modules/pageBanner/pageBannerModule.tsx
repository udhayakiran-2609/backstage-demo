import React from 'react';
import {
  createFrontendModule,
  PluginWrapperBlueprint,
} from '@backstage/frontend-plugin-api';
import { PageBannerWrapper } from '../../components/PageBanner/PageBannerWrapper';

const pageBannerWrapper = PluginWrapperBlueprint.make({
  name: 'page-banner-wrapper',
  params: defineParams =>
    defineParams({
      loader: async () => ({
        component: ({
          children,
        }: {
          children: React.ReactNode;
          value: never;
        }) => <PageBannerWrapper>{children}</PageBannerWrapper>,
      }),
    }),
});

export const pageBannerModule = createFrontendModule({
  pluginId: 'app',
  extensions: [pageBannerWrapper],
});