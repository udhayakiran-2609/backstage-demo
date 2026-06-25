// catalogGraphModule.tsx
import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { EntityRelationsGraph } from '@backstage/plugin-catalog-graph';
import { useEntity } from '@backstage/plugin-catalog-react';
import { CustomRenderNode } from './CustomRenderNode';

const CatalogGraphCard = () => {
  const { entity } = useEntity();

  return (
    <EntityRelationsGraph
      rootEntityNames={{
        kind: entity.kind,
        namespace: entity.metadata.namespace ?? 'default',
        name: entity.metadata.name,
      }}
      renderNode={CustomRenderNode}
      maxDepth={1}
      unidirectional={false}
      mergeRelations
    />
  );
};

export const catalogGraphModule = createFrontendModule({
  pluginId: 'catalog-graph',
  extensions: [
    EntityCardBlueprint.make({
      name: 'relations',
      params: {
        loader: async () => <CatalogGraphCard />,
      },
    }),
  ],
});