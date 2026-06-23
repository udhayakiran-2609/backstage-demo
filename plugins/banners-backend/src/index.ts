import path from 'path';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createBannersRouter } from './router';
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
        const client = await database.getClient();

        await client.migrate.latest({
          directory: path.join(__dirname, 'migrations'),
        });

        const db = new BannerDatabase(client);
        const router = createBannersRouter(db);

        httpRouter.use(router);

        logger.info(
          'Banners plugin initialized — REST API ready at /api/banners',
        );
      },
    });
  },
});

export default bannersPlugin;