import React from 'react';
import {
  Content,
  Header,
  Page,
  InfoCard,
} from '@backstage/core-components';

import {
  CatalogFilterLayout,
  EntityKindPicker,
  EntityOwnerPicker,
  EntityTypePicker,
  UserListPicker,
} from '@backstage/plugin-catalog-react';

import { CatalogTable } from '@backstage/plugin-catalog';

import {
  Grid,
  Box,
} from '@mui/material';

export const CustomCatalogPage = () => {
  return (
    <Page themeId="tool">
      <Header
        title="Services Catalog"
        subtitle="Browse all components and services"
      />

      <Content>

        {/* Statistics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <InfoCard title="Components">
              19
            </InfoCard>
          </Grid>

          <Grid item xs={12} md={3}>
            <InfoCard title="Production">
              15
            </InfoCard>
          </Grid>

          <Grid item xs={12} md={3}>
            <InfoCard title="Experimental">
              4
            </InfoCard>
          </Grid>

          <Grid item xs={12} md={3}>
            <InfoCard title="Owners">
              6
            </InfoCard>
          </Grid>
        </Grid>

        <CatalogFilterLayout>

          {/* Top Filters */}
          <CatalogFilterLayout.Filters>

            <Box
              display="flex"
              gap={2}
              flexWrap="wrap"
              mb={3}
            >
              <EntityKindPicker />
              <EntityTypePicker />
              <EntityOwnerPicker />
              <UserListPicker />
            </Box>

          </CatalogFilterLayout.Filters>

          {/* Catalog Table */}
          <CatalogFilterLayout.Content>
            <CatalogTable />
          </CatalogFilterLayout.Content>

        </CatalogFilterLayout>

      </Content>
    </Page>
  );
};