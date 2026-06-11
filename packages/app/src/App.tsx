import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { navModule } from './modules/nav';

import { oktaAuthApiRef,googleAuthApiRef  } from '@backstage/core-plugin-api';
import { SignInPageBlueprint } from '@backstage/plugin-app-react';
import { SignInPage } from '@backstage/core-components';
import { createFrontendModule } from '@backstage/frontend-plugin-api';
import techRadarPlugin from '@backstage-community/plugin-tech-radar/alpha';
import { techDocsReportIssueAddonModule } from '@backstage/plugin-techdocs-module-addons-contrib/alpha';

const signInPage = SignInPageBlueprint.make({
  params: {
    loader: async () => props =>
      (
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
    catalogPlugin,
    navModule,
    techRadarPlugin,
    techDocsReportIssueAddonModule,
    createFrontendModule({
      pluginId: 'app',
      extensions: [signInPage],
    }),
  ],
});