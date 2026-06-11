import { createBackendModule } from '@backstage/backend-plugin-api';
import {
  authProvidersExtensionPoint,
  createOAuthProviderFactory,
} from '@backstage/plugin-auth-node';

import { googleAuthenticator } from '@backstage/plugin-auth-backend-module-google-provider';

import {
  DEFAULT_NAMESPACE,
  stringifyEntityRef,
} from '@backstage/catalog-model';

export const customGoogleAuthModule = createBackendModule({
  pluginId: 'auth',
  moduleId: 'custom-google-provider',

  register(reg) {
    reg.registerInit({
      deps: {
        providers: authProvidersExtensionPoint,
      },

      async init({ providers }) {
        providers.registerProvider({
          providerId: 'google',

          factory: createOAuthProviderFactory({
            authenticator: googleAuthenticator,

            async signInResolver(info, ctx) {
              const email = info.profile.email;

              if (!email) {
                throw new Error('Google profile has no email');
              }

              // Optional domain restriction
              // if (!email.endsWith('@yourcompany.com')) {
              //   throw new Error('Unauthorized');
              // }

              const username = email.split('@')[0];

              const userRef = stringifyEntityRef({
                kind: 'User',
                namespace: DEFAULT_NAMESPACE,
                name: username,
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