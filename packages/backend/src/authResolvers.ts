import {
  createSignInResolverFactory,
  SignInInfo,
  AuthResolverContext,
} from '@backstage/plugin-auth-node';
import { NotAllowedError } from '@backstage/errors';

// const ALLOWED_DOMAIN = 'yourcompany.com';

async function resolveByEmail(
  email: string,
  provider: string,
  ctx: AuthResolverContext,
) {
//   const domain = email.split('@')[1];
//   if (domain !== ALLOWED_DOMAIN) {
//     throw new NotAllowedError(
//       `Sign-in denied: '${email}' is not from @${ALLOWED_DOMAIN}.`,
//     );
//   }

  try {
    const userEntity = await ctx.findCatalogUser({
      filter: { 'spec.profile.email': email },
    });
    return ctx.issueToken({
      claims: {
        sub: userEntity.entity.metadata.name,
        ent: [`user:default/${userEntity.entity.metadata.name}`],
      },
    });
  } catch {
    // ── Step 3: Not in catalog → auto-provision from provider profile ───
    // Anyone with a valid @yourcompany.com email gets in,
    // no manual catalog entry needed.
    const username = email.split('@')[0]; // e.g. udhayakaran

    return ctx.issueToken({
      claims: {
        sub: `user:default/${username}`,
        ent: [`user:default/${username}`],
      },
    });
    }
}

export const oktaDomainEmailResolver = createSignInResolverFactory({
  create() {
    return async (info: SignInInfo<any>, ctx: AuthResolverContext) => {
      // info.profile.email is normalized by Backstage from Okta's claims
      const email = info.profile?.email;
      if (!email) throw new NotAllowedError('Okta: no email in profile.');
      return resolveByEmail(email, 'Okta', ctx);
    };
  },
});

export const googleDomainEmailResolver = createSignInResolverFactory({
  create() {
    return async (info: SignInInfo<any>, ctx: AuthResolverContext) => {
      const email = info.profile?.email;
      if (!email) throw new NotAllowedError('Google: no email in profile.');
      return resolveByEmail(email, 'Google', ctx);
    };
  },
});