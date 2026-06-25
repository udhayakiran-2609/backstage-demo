import path from 'path';
import { coreServices, createBackendPlugin } from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { BannerDatabase } from './BannerDatabase';

export const bannerAdminBackendPlugin = createBackendPlugin({
  pluginId: 'banners',   // ← must match what discoveryApi.getBaseUrl('banners') expects
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        database: coreServices.database,
        logger: coreServices.logger,
      },
      async init({ httpRouter, database, logger }) {
        const knex = await database.getClient();
        await knex.migrate.latest({
          directory: path.resolve(__dirname, '../migrations'),
        });
        const db = new BannerDatabase(knex);
        const router = await createRouter({ db, logger });
        httpRouter.use(router);
        logger.info('Banner admin backend initialized');
      },
    });
  },
});

export default bannerAdminBackendPlugin;