// packages/app/src/hoc/withPermission.tsx
//
// Permission-gating utilities compatible with Backstage 1.52 alpha system.
// These work in any component — extension components, page blueprints, etc.
//
import  { ComponentType, ReactNode } from 'react';
import { Progress } from '@backstage/core-components';
import { useHasPermission, useCurrentRole, type PermissionKey } from '../hooks/usePermissions';

// ────────────────────────────────────────────────────────────────────────────
// withPermission — HOC
// ────────────────────────────────────────────────────────────────────────────
// Usage:
//   const ProtectedButton = withPermission(MyButton, 'catalog.entity.create');
//   <ProtectedButton />  ← renders nothing if not allowed
//
export function withPermission<P extends object>(
  WrappedComponent: ComponentType<P>,
  permissionKey: PermissionKey,
  fallback: ReactNode = null,
  options: { showLoading?: boolean } = {},
): ComponentType<P> {
  const { showLoading = false } = options;

  function PermissionGated(props: P) {
    const { allowed, loading } = useHasPermission(permissionKey);
    if (loading) return showLoading ? <Progress /> : null;
    if (!allowed) return <>{fallback}</>;
    return <WrappedComponent {...props} />;
  }

  PermissionGated.displayName = `WithPermission(${
    WrappedComponent.displayName ?? WrappedComponent.name
  }, ${permissionKey})`;

  return PermissionGated;
}

// ────────────────────────────────────────────────────────────────────────────
// PermissionGate — inline JSX gate
// ────────────────────────────────────────────────────────────────────────────
// Usage:
//   <PermissionGate permission="catalog.entity.create">
//     <CreateButton />
//   </PermissionGate>
//
interface PermissionGateProps {
  permission: PermissionKey;
  children: ReactNode;
  fallback?: ReactNode;
  showLoading?: boolean;
}

export function PermissionGate({
  permission,
  children,
  fallback = null,
  showLoading = false,
}: PermissionGateProps) {
  const { allowed, loading } = useHasPermission(permission);
  if (loading) return showLoading ? <Progress /> : null;
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}

// ────────────────────────────────────────────────────────────────────────────
// RoleGate — renders different content depending on the user's effective role
// ────────────────────────────────────────────────────────────────────────────
// Usage:
//   <RoleGate
//     admin={<AdminPanel />}
//     owner={<OwnerPanel />}
//     user={<UserPanel />}
//   />
//
interface RoleGateProps {
  admin?: ReactNode;
  owner?: ReactNode;
  user?: ReactNode;
}

export function RoleGate({ admin, owner, user }: RoleGateProps) {
  const { isAdmin, isOwner, loading } = useCurrentRole();
  if (loading) return null;
  if (isAdmin) return <>{admin}</>;
  if (isOwner) return <>{owner}</>;
  return <>{user}</>;
}
