// packages/app/src/hooks/usePermissions.ts
//
// Permission hooks for Backstage 1.52 alpha system.
// Works with the new declarative frontend — no changes to hook API needed
// since @backstage/plugin-permission-react is not version-locked to the
// old createApp. Import and use these hooks in any component.
//
import { useMemo } from 'react';
import { usePermission } from '@backstage/plugin-permission-react';
import {
  catalogEntityCreatePermission,
  catalogEntityDeletePermission,
  catalogEntityReadPermission,
  catalogLocationCreatePermission,
} from '@backstage/plugin-catalog-common/alpha';
import {
  taskCreatePermission,
  taskCancelPermission,
  taskReadPermission,
  actionExecutePermission,
} from '@backstage/plugin-scaffolder-common/alpha';
import {
  policyEntityCreatePermission,
  policyEntityReadPermission,
  policyEntityUpdatePermission,
  policyEntityDeletePermission,
} from '@backstage-community/plugin-rbac-common';

// ── Permission key union ───────────────────────────────────────────────────────
export type PermissionKey =
  | 'catalog.entity.read'
  | 'catalog.entity.create'
  | 'catalog.entity.delete'
  | 'catalog.location.create'
  | 'scaffolder.task.create'
  | 'scaffolder.task.read'
  | 'scaffolder.task.cancel'
  | 'scaffolder.action.execute'
  | 'policy.entity.read'
  | 'policy.entity.create'
  | 'policy.entity.update'
  | 'policy.entity.delete';

// Map keys → Backstage permission objects
const PERMISSION_MAP: Record<PermissionKey, any> = {
  'catalog.entity.read': catalogEntityReadPermission,
  'catalog.entity.create': catalogEntityCreatePermission,
  'catalog.entity.delete': catalogEntityDeletePermission,
  'catalog.location.create': catalogLocationCreatePermission,
  'scaffolder.task.create': taskCreatePermission,
  'scaffolder.task.read': taskReadPermission,
  'scaffolder.task.cancel': taskCancelPermission,
  'scaffolder.action.execute': actionExecutePermission,
  'policy.entity.read': policyEntityReadPermission,
  'policy.entity.create': policyEntityCreatePermission,
  'policy.entity.update': policyEntityUpdatePermission,
  'policy.entity.delete': policyEntityDeletePermission,
};

// ── Single permission check ────────────────────────────────────────────────────
export function useHasPermission(key: PermissionKey): {
  allowed: boolean;
  loading: boolean;
} {
  const permission = PERMISSION_MAP[key];
  const { allowed, loading } = usePermission({ permission });
  return { allowed, loading };
}

// ── Bulk permission check ─────────────────────────────────────────────────────
// NOTE: Hook call order must be stable — never call this conditionally.
export function usePermissions(keys: PermissionKey[]): {
  permissions: Record<PermissionKey, boolean>;
  loading: boolean;
} {
  const results = keys.map(key =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    usePermission({ permission: PERMISSION_MAP[key] }),
  );

  const loading = results.some(r => r.loading);

  const permissions = useMemo(
    () =>
      Object.fromEntries(
        keys.map((key, i) => [key, results[i].allowed]),
      ) as Record<PermissionKey, boolean>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loading, ...results.map(r => r.allowed)],
  );

  return { permissions, loading };
}

// ── Role detection (derived from permission results, no extra API call) ────────
export function useCurrentRole(): {
  isAdmin: boolean;
  isOwner: boolean;
  isUser: boolean;
  loading: boolean;
} {
  const { permissions, loading } = usePermissions([
    'policy.entity.create',   // admins only
    'catalog.entity.delete',  // admins + owners
    'catalog.entity.create',  // admins + owners
  ]);

  const isAdmin = permissions['policy.entity.create'];
  const isOwner = !isAdmin && permissions['catalog.entity.delete'];
  const isUser = !isAdmin && !isOwner;

  return { isAdmin, isOwner, isUser, loading };
}
