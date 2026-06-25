// packages/backend/src/permissions/permissionPolicy.ts
//
// This policy acts as the FALLBACK layer beneath the RBAC CSV rules.
// The RBAC backend (@backstage-community/plugin-rbac-backend) handles
// all role-based decisions from rbac-policy.csv.
//
// This file is kept for:
//   1. Seeding every authenticated user into role:default/user dynamically
//      (since we can't put "*" in the CSV for all google users)
//   2. A safety net DENY for unauthenticated requests
//   3. Optional: any bespoke logic outside RBAC's scope
//
// NOTE: When using @backstage-community/plugin-rbac-backend, you do NOT
// register this via policyExtensionPoint. The RBAC backend IS the policy.
// This file is documentation + a reference for the logic embedded in the
// RBAC backend's defaultRole feature (see app-config.yaml below).
//
// To enable "every authenticated user = role:default/user" WITHOUT code,
// add to app-config.yaml under permission.rbac:
//
//   rbac:
//     defaultPermissions:
//       defaultRole: role:default/user
//
// That config line alone makes every signed-in user inherit role:default/user.
// The CSV then controls exactly what that role can do.

import {
  AuthorizeResult,
  PolicyDecision,
  isResourcePermission,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
  PolicyQueryUser,
} from '@backstage/plugin-permission-node';
import {
  catalogConditions,
  createCatalogConditionalDecision,
} from '@backstage/plugin-catalog-backend/alpha';
import {
  catalogEntityCreatePermission,
  catalogEntityDeletePermission,
  catalogEntityRefreshPermission,
  catalogLocationCreatePermission,
  catalogLocationDeletePermission,
} from '@backstage/plugin-catalog-common/alpha';
import {
  taskCancelPermission,
  taskCreatePermission,
  taskReadPermission,
  templateParameterReadPermission,
  templateStepReadPermission,
  actionExecutePermission,
} from '@backstage/plugin-scaffolder-common/alpha';
import { isPermission } from '@backstage/plugin-permission-common';

// Static owner usernames (email local-parts, normalized)
const ADMIN_USERS = new Set([
  'user:default/owner_one',
  'user:default/owner_two',
  'user:default/owner_three',
  'user:default/owner_four',
]);

function isAdmin(user?: PolicyQueryUser): boolean {
  if (!user) return false;
  const sub = user.info.userEntityRef;
  const groups = user.info.ownershipEntityRefs;
  return (
    ADMIN_USERS.has(sub) ||
    groups.includes('group:default/admins') ||
    groups.includes('group:default/platform')
  );
}

function isOwner(user?: PolicyQueryUser): boolean {
  if (!user) return false;
  const groups = user.info.ownershipEntityRefs;
  return (
    groups.includes('group:default/owners') ||
    groups.includes('group:default/engineering') ||
    isAdmin(user)
  );
}

/**
 * BackstagePermissionPolicy
 *
 * Used ONLY when NOT using @backstage-community/plugin-rbac-backend.
 * If you ARE using the RBAC backend plugin, this is replaced by the
 * rbac-policy.csv engine. Keep this as a reference / fallback.
 */
export class BackstagePermissionPolicy implements PermissionPolicy {
  async handle(
    request: PolicyQuery,
    user?: PolicyQueryUser,
  ): Promise<PolicyDecision> {

    // ── No user = deny everything ────────────────────────────────────────────
    if (!user) {
      return { result: AuthorizeResult.DENY };
    }

    const admin = isAdmin(user);
    const owner = isOwner(user);

    // ── Admins: allow everything ─────────────────────────────────────────────
    if (admin) {
      return { result: AuthorizeResult.ALLOW };
    }

    // ── Catalog entity resource permissions (conditional) ─────────────────────
    if (isResourcePermission(request.permission, 'catalog-entity')) {

      // Owner: CRUD on entities they own
      if (owner) {
        if (
          isPermission(request.permission, catalogEntityDeletePermission) ||
          isPermission(request.permission, catalogEntityRefreshPermission)
        ) {
          return createCatalogConditionalDecision(
            request.permission,
            catalogConditions.isEntityOwner({
              claims: user.info.ownershipEntityRefs,
            }),
          );
        }
        // Owner can update owned entities
        return createCatalogConditionalDecision(
          request.permission,
          catalogConditions.isEntityOwner({
            claims: user.info.ownershipEntityRefs,
          }),
        );
      }

      // Regular user: read-only, no private entities
      if (isPermission(request.permission, catalogEntityDeletePermission)) {
        return { result: AuthorizeResult.DENY };
      }

      // Read: allow all non-private entities
      return createCatalogConditionalDecision(
        request.permission,
        {
          not: catalogConditions.hasMetadata({
            key: 'tags',
            value: 'private',
          }),
        },
      );
    }

    // ── Catalog non-resource permissions ─────────────────────────────────────
    if (isPermission(request.permission, catalogEntityCreatePermission)) {
      return { result: owner ? AuthorizeResult.ALLOW : AuthorizeResult.DENY };
    }

    if (isPermission(request.permission, catalogLocationCreatePermission)) {
      return { result: owner ? AuthorizeResult.ALLOW : AuthorizeResult.DENY };
    }

    if (isPermission(request.permission, catalogLocationDeletePermission)) {
      return { result: AuthorizeResult.DENY }; // admin-only handled above
    }

    // ── Scaffolder permissions ────────────────────────────────────────────────
    if (isPermission(request.permission, taskCreatePermission)) {
      // All authenticated users can create scaffolder tasks
      return { result: AuthorizeResult.ALLOW };
    }

    if (isPermission(request.permission, taskReadPermission)) {
      return { result: AuthorizeResult.ALLOW };
    }

    if (isPermission(request.permission, taskCancelPermission)) {
      // Only owners/admins can cancel (users can only cancel their own via conditions)
      return { result: owner ? AuthorizeResult.ALLOW : AuthorizeResult.DENY };
    }

    if (
      isPermission(request.permission, templateParameterReadPermission) ||
      isPermission(request.permission, templateStepReadPermission)
    ) {
      return { result: AuthorizeResult.ALLOW };
    }

    if (isPermission(request.permission, actionExecutePermission)) {
      return { result: AuthorizeResult.ALLOW };
    }

    // ── Default: allow (safe default, CSV policies layer deny on top) ─────────
    return { result: AuthorizeResult.ALLOW };
  }
}
