import path from 'path';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { BannerDatabase } from './BannerDatabase';

export const bannersPlugin = createBackendPlugin({
  pluginId: 'banners',
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
          directory: path.resolve(__dirname, '../src/migrations'),
        });

        const db = new BannerDatabase(knex);

        const router = await createRouter({
          db,
          logger,
        });

        httpRouter.use(router);

        logger.info('Banners plugin initialized');
      },
    });
  },
});

export default bannersPlugin;