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

const STATIC_OWNER_EMAILS = new Set([
  'udhayakiran2110@gmail.com',
  'udhayakaran@elitecorpusa.com',
  'owner.three@yourcompany.com',
  'owner.four@yourcompany.com',
]);
// const ALLOWED_DOMAIN = 'yourcompany.com'; 

function emailToUsername(email: string): string {
  const [localPart] = email.split('@');
  return localPart.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
}

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
              const { profile } = info;
              if (!profile.email) {
                throw new Error(
                  'Google profile does not include an email address.',
                );
              }
              const email = profile.email.toLowerCase();
              const [,] = email.split('@');

              // ── 2. Enforce company domain ────────────────────────────────────
              // if (domain !== ALLOWED_DOMAIN) {
              //   throw new Error(
              //     `Sign-in rejected: '${email}' is not a @${ALLOWED_DOMAIN} account.`,
              //   );
              // }

          

              // Optional domain restriction
              // if (!email.endsWith('@yourcompany.com')) {
              //   throw new Error('Unauthorized');
              // }

             const username = emailToUsername(email);
              const userEntityRef = stringifyEntityRef({
                kind: 'User',
                namespace: DEFAULT_NAMESPACE,
                name: username,
              });
              const isStaticOwner = STATIC_OWNER_EMAILS.has(email);
              console.log(username, 'hieeeeeeee');
              
               // ── 3. Try to resolve against catalog User entity ────────────────
              try {
                const identity = await ctx.signInWithCatalogUser({
                  entityRef: {
                    kind: 'User',
                    namespace: DEFAULT_NAMESPACE,
                    name: username,
                  },
                });

                // Static owners: inject admin group claim on top of catalog claims
                if (isStaticOwner) {
                  // The RBAC engine reads `ent` claims for ownership checks.
                  // We inject group:default/admins so the CSV rule
                  // "g, group:default/admins, role:default/admin" applies.
                  const adminGroupRef = stringifyEntityRef({
                    kind: 'Group',
                    namespace: DEFAULT_NAMESPACE,
                    name: 'admins',
                  });

                  return ctx.issueToken({
                    claims: {
                      sub: userEntityRef,
                      ent: [
                        ...(identity.token
                          ? [] 
                          : [userEntityRef]),
                        adminGroupRef,
                      ],
                    },
                  });
                }

                return identity;
              } catch (e) {
                // ── 4. User not in catalog yet → auto-provision as basic user ──
                const claims: { sub: string; ent: string[] } = {
                  sub: userEntityRef,
                  ent: [userEntityRef],
                };
                if (isStaticOwner) {
                  claims.ent.push(
                    stringifyEntityRef({
                      kind: 'Group',
                      namespace: DEFAULT_NAMESPACE,
                      name: 'admins',
                    }),
                  );
                }
                return ctx.issueToken({ claims });
              }
            },
          }),
        });
      },
    });
  },
});