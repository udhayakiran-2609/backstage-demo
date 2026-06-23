import React from 'react';
import {
  createFrontendPlugin,
  PageBlueprint,
  ApiBlueprint,
  createApiFactory,
} from '@backstage/frontend-plugin-api';
import {
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { bannersApiRef, BannersClient } from '../api/BannersClient';

const bannerAdminPage = PageBlueprint.make({
  name: 'banner-admin-page',
  params: {
    path: '/banner-admin',
    loader: async () => {
      const { BannerAdminPage } = await import('../components/BannerAdminPage');
      return <BannerAdminPage />;
    },
  },
});

const bannersApiExtension = ApiBlueprint.make({
  name: 'banners-api',
  params: defineParams =>
    defineParams(
      createApiFactory({
        api: bannersApiRef,
        deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
        factory: ({ discoveryApi, fetchApi }) =>
          new BannersClient(discoveryApi, fetchApi),
      }),
    ),
});

export const bannersAdminPlugin = createFrontendPlugin({
  pluginId: 'banners-admin',
  extensions: [bannerAdminPage, bannersApiExtension],
});
