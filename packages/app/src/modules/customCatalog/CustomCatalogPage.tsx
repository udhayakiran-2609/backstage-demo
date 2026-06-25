import Grid from '@material-ui/core/Grid';

import {
  Page,
  Header,
  Content,
  InfoCard,
} from '@backstage/core-components';

import {
  EntityListProvider,
  useEntityList,
} from '@backstage/plugin-catalog-react';

import { EntityCard } from './EntityCard';

const CatalogBody = () => {
  const { entities } = useEntityList();

  return (
    <>
      <Grid container spacing={3}>
        <Grid item md={3}>
          <InfoCard title="Total">
            {entities.length}
          </InfoCard>
        </Grid>

        <Grid item md={3}>
          <InfoCard title="Production">
            {
              entities.filter(
                e => e.spec?.lifecycle === 'production',
              ).length
            }
          </InfoCard>
        </Grid>

        <Grid item md={3}>
          <InfoCard title="Services">
            {
              entities.filter(
                e => e.spec?.type === 'service',
              ).length
            }
          </InfoCard>
        </Grid>

        <Grid item md={3}>
          <InfoCard title="Experimental">
            {
              entities.filter(
                e => e.spec?.lifecycle === 'experimental',
              ).length
            }
          </InfoCard>
        </Grid>
      </Grid>

      <br />

      <Grid container spacing={3}>
        {entities.map(entity => (
          <Grid item xs={12} md={4} key={entity.metadata.uid}>
            <EntityCard entity={entity} />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export const CustomCatalogPage = () => {
  return (
    <Page themeId="tool">
      <Header
        title="Service Catalog"
        subtitle="Browse all services"
      />

      <Content>
        <EntityListProvider>
          <CatalogBody />
        </EntityListProvider>
      </Content>
    </Page>
  );
};