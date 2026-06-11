import { createBackendModule } from '@backstage/backend-plugin-api';
import {
  authProvidersExtensionPoint,
  createOAuthProviderFactory,
} from '@backstage/plugin-auth-node';

import { oktaAuthenticator } from '@backstage/plugin-auth-backend-module-okta-provider';
import {
  stringifyEntityRef,
} from '@backstage/catalog-model';

export const customOktaAuth = createBackendModule({
  pluginId: 'auth',
  moduleId: 'custom-okta-auth',

  register(reg) {
    reg.registerInit({
      deps: {
        providers: authProvidersExtensionPoint,
      },
      async init({ providers }) {
        providers.registerProvider({
          providerId: 'okta',

          factory: createOAuthProviderFactory({
            authenticator: oktaAuthenticator,

            async signInResolver(info, ctx) {
              const email = info.profile.email;

              if (!email) {
                throw new Error('No email found in Okta profile');
              }
              // const allowedDomain = 'mycompany.com';

              // if (!email.toLowerCase().endsWith(`@${allowedDomain}`)) {
              //   throw new Error('User is not part of the organization');
              // }

              const userRef = stringifyEntityRef({
                kind: 'User',
                namespace: 'default',
                name: email.split('@')[0].toLowerCase(),
              });

              return ctx.issueToken({
                claims: {
                  sub: userRef,
                  ent: [userRef],
                },
              });
            },
          }),
        });
      },
    });
  },
});