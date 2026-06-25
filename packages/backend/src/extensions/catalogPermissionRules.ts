// packages/backend/src/extensions/catalogPermissionRules.ts
//
// In Backstage 1.52, the catalog backend automatically registers
// IS_ENTITY_OWNER and all other built-in permission rules with the
// PermissionsRegistryService — no manual wiring is needed.
//
// `catalogPermissionRulesServiceRef` was removed from
// @backstage/plugin-catalog-backend/alpha at this version.
//
// This module is intentionally minimal: it exists as a hook point for
// adding CUSTOM permission rules. The built-in rules (IS_ENTITY_OWNER,
// HAS_METADATA, IS_ENTITY_KIND, HAS_ANNOTATION, HAS_LABEL, HAS_SPEC)
// are registered automatically by the catalog backend plugin itself.
//
import {
  createBackendModule,
  coreServices,
} from '@backstage/backend-plugin-api';

export default createBackendModule({
  pluginId: 'catalog',
  moduleId: 'permission-rules',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
      },
      async init({ logger }) {
        logger.info(
          'catalog/permission-rules: built-in rules (IS_ENTITY_OWNER etc.) ' +
            'are auto-registered by the catalog backend in Backstage 1.52. ' +
            'Add custom rules here if needed.',
        );

        // ── How to add a CUSTOM rule ──────────────────────────────────────────
        // 1. Install: yarn workspace backend add @backstage/plugin-catalog-backend
        // 2. Import the extension point:
        //
        //    import { catalogPermissionExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
        //
        // 3. Add to deps: { rules: catalogPermissionExtensionPoint }
        //
        // 4. In init({ rules, logger }):
        //    rules.addPermissionRules([myCustomRule]);
        //
        // Example rule skeleton:
        //
        //   import { createCatalogPermissionRule } from '@backstage/plugin-catalog-backend/alpha';
        //   import { z } from 'zod';
        //
        //   const isInDomain = createCatalogPermissionRule({
        //     name: 'IS_IN_DOMAIN',
        //     description: 'Checks if an entity belongs to a specific domain',
        //     resourceType: 'catalog-entity',
        //     paramsSchema: z.object({ domain: z.string() }),
        //     apply: (resource, { domain }) =>
        //       resource.relations?.some(
        //         r => r.type === 'partOf' && r.targetRef.startsWith(`domain:${domain}`),
        //       ) ?? false,
        //     toQuery: ({ domain }) => ({
        //       key: 'relations.partOf',
        //       values: [`domain:default/${domain}`],
        //     }),
        //   });
      },
    });
  },
});
