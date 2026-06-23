import React from 'react';
import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { navModule } from './modules/nav';
import { oktaAuthApiRef, googleAuthApiRef } from '@backstage/core-plugin-api';
import { SignInPageBlueprint } from '@backstage/plugin-app-react';
import { SignInPage } from '@backstage/core-components';
import { createFrontendModule , AppRootElementBlueprint} from '@backstage/frontend-plugin-api';
import techRadarPlugin from '@backstage-community/plugin-tech-radar/alpha';
import { techDocsReportIssueAddonModule } from '@backstage/plugin-techdocs-module-addons-contrib/alpha';
import notificationsPlugin from '@backstage/plugin-notifications/alpha';
import { ThemeBlueprint } from '@backstage/plugin-app-react';
import { UnifiedThemeProvider } from '@backstage/theme';
import LightIcon from '@material-ui/icons/WbSunny';
import { myTheme } from './theme/myTheme';
import catalogGraphPlugin from '@backstage/plugin-catalog-graph/alpha';
import catalogGraphModule from './modules/catalogGraphModule';
// import { GlobalBannerBar } from './modules/banner/GlobalBannerBar';
import GridEntityRelationsCard  from './components/catalog/GridEntityRelationsCard';


import { bannerModule } from './modules/banner/bannerModule';
import { bannersAdminPlugin } from '../../../plugins/banners-admin/src/plugin/plugin';

// import customCatalogModule from './modules/customCatalog/catalogModule';
import {topNavbarModule} from './modules/topNavbar/topNavbarModule';
// ── Page image banner system (section banners + empty-state banners) ────────
// Replaces the old top-bar bannerModule.
// All banner content is managed in app-config.yaml → pageBanners.*
// import { pageBannerModule } from './modules/pageBanner/pageBannerModule';

const myThemeExtension = ThemeBlueprint.make({
  name: 'my-theme',
  params: {
    theme: {
      id: 'my-theme',
      title: 'My Custom Theme',
      variant: 'light',
      icon: <LightIcon />,
      Provider: ({ children }) => (
        <UnifiedThemeProvider theme={myTheme} children={children} />
      ),
    },
  },
});

// const globalBannerExtension = AppRootElementBlueprint.make({
//   name: 'global-banner-bar',
//   params: {
//     element: <GlobalBannerBar />,
//   },
// });

// const globalBannerRootModule = createFrontendModule({
//   pluginId: 'app',
//   extensions: [globalBannerExtension],
// });
const signInPage = SignInPageBlueprint.make({
  params: {
    loader: async () => props => (
      <SignInPage
        {...props}
        providers={[
          {
            id: 'okta-auth-provider',
            title: 'Okta',
            message: 'Sign in with your Okta account',
            apiRef: oktaAuthApiRef,
          },
          {
            id: 'google-auth-provider',
            title: 'Google Workspace',
            message: 'Sign in with your Google account',
            apiRef: googleAuthApiRef,
          },
        ]}
      />
    ),
  },
});

export default createApp({
  features: [
    topNavbarModule,
    catalogPlugin,
    catalogGraphPlugin,
    catalogGraphModule,
    navModule,
    // customCatalogModule,
    // ↓ Page image banners (section + empty-state) — config-driven
    // pageBannerModule,
    bannerModule,
    bannersAdminPlugin,    // /banner-admin page + BannersClient API
    // globalBannerRootModule,
    techRadarPlugin,
    techDocsReportIssueAddonModule,
    notificationsPlugin,
    // GridEntityRelationsCard,
    // userSettingsPlugin,
    // profileAvatarModule,
    createFrontendModule({
      pluginId: 'app',
      extensions: [signInPage, myThemeExtension],
    }),
  ],
});
