import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { DatabaseFeedbackStore } from './service/DatabaseFeedbackStore';
import { InMemoryFeedbackStore } from './service/InMemoryFeedbackStore';
import { FeedbackStore } from './service/types';

/**
 * The feedback backend plugin.
 *
 * Storage: by default this uses Backstage's standard DatabaseService,
 * which means:
 *  - In local development (the default `backend.database.client:
 *    better-sqlite3` with no `connection`), data is stored in a SQLite
 *    file under your backend's working directory — effectively
 *    zero-config "in memory for dev" behavior.
 *  - In production, point `backend.database` at Postgres in
 *    app-config.production.yaml as you would for any other plugin, and
 *    this store automatically runs against Postgres instead — no code
 *    changes required.
 *
 * Setting `feedback.inMemoryOnly: true` in config forces the pure
 * in-memory (non-persistent) store instead, useful for ephemeral demo
 * environments or fast iteration without touching disk at all.
 */
export const feedbackPlugin = createBackendPlugin({
  pluginId: 'feedback',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
        database: coreServices.database,
        config: coreServices.rootConfig,
        httpAuth: coreServices.httpAuth,
        userInfo: coreServices.userInfo,
      },
      async init({ logger, httpRouter, database, config, httpAuth, userInfo }) {
        const inMemoryOnly = config.getOptionalBoolean('feedback.inMemoryOnly') ?? false;

        let store: FeedbackStore;
        if (inMemoryOnly) {
          logger.warn(
            'feedback plugin is running with inMemoryOnly: true — feedback will NOT persist across restarts',
          );
          store = new InMemoryFeedbackStore();
        } else {
          const knexClient = await database.getClient();
          store = await DatabaseFeedbackStore.create(knexClient);
        }

        const router = await createRouter({
          store,
          getUserRef: async req => {
            try {
              const credentials = await httpAuth.credentials(req, { allow: ['user'] });
              const info = await userInfo.getUserInfo(credentials);
              return info.userEntityRef;
            } catch {
              // Unauthenticated / anonymous request. Allowed through here;
              // lock this down via httpAuth.credentials({ allow: ['user'] })
              // without a try/catch if anonymous feedback shouldn't be permitted.
              return undefined;
            }
          },
        });

        httpRouter.use(router);

        logger.info('Feedback backend plugin initialized');
      },
    });
  },
});

export default feedbackPlugin;
