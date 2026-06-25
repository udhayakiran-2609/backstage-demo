// packages/app/src/modules/rbac/rbacNavModule.ts
//
// No-op module — the RBAC admin nav item is added directly in your
// existing navModule sidebar (see instruction below).
//
// NavItemBlueprint does NOT exist in @backstage/plugin-app-react@0.2.4
// (your installed version). Don't use it.
//
import { createFrontendModule } from '@backstage/frontend-plugin-api';

export const rbacNavModule = createFrontendModule({
  pluginId: 'app',
  extensions: [],
});

// ── ADD THIS to your existing navModule sidebar JSX ───────────────────────────
//
//   import React from 'react';
//   import { usePermission } from '@backstage/plugin-permission-react';
//   import { policyEntityReadPermission } from '@backstage-community/plugin-rbac-common';
//   import SecurityIcon from '@material-ui/icons/Security';
//   import { SidebarItem } from '@backstage/core-components';
//
//   function AdminNavItem() {
//     const { allowed, loading } = usePermission({
//       permission: policyEntityReadPermission,
//     });
//     if (loading || !allowed) return null;
//     return <SidebarItem icon={SecurityIcon} to="/rbac" text="Administration" />;
//   }
//
//   // Inside your <Sidebar> JSX, add near the bottom:
//   <AdminNavItem />
