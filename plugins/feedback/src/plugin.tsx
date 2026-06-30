import React from 'react';
import {
  ApiBlueprint,
  coreExtensionData,
  createExtensionBlueprint,
  createFrontendPlugin,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import {
  EntityCardBlueprint,
} from '@backstage/plugin-catalog-react/alpha';
import { discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import FeedbackIcon from '@material-ui/icons/Feedback';
import { FeedbackApiClient, feedbackApiRef } from './api';

/**
 * Generic blueprint for contributing a standalone React element into the
 * app root (outside the routed page tree) — this is the new-frontend-
 * system equivalent of mounting <FeedbackWidget /> directly in App.tsx
 * under the old system. Used below for the floating feedback button.
 */
const AppRootElementBlueprint = createExtensionBlueprint({
  kind: 'app-root-element',
  attachTo: { id: 'app/root', input: 'elements' },
  output: [coreExtensionData.reactElement],
  factory: (params: { element: JSX.Element }) => [
    coreExtensionData.reactElement(params.element),
  ],
});

/**
 * A floating action button, mounted app-wide, that opens a dialog for
 * submitting general (not entity-scoped) feedback. No route of its own.
 */
const feedbackWidget = AppRootElementBlueprint.make({
  name: 'widget',
  params: {
    element: React.createElement(
      React.lazy(() =>
        import('./components/FeedbackWidget').then(m => ({
          default: m.FeedbackWidget,
        })),
      ),
    ),
  },
});

/**
 * API extension — registers the feedback API implementation against the
 * standard discovery/fetch APIs. Equivalent of the old createApiFactory.
 */
const feedbackApiExtension = ApiBlueprint.make({
  name: 'feedback',
  params: define =>
    define({
      api: feedbackApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new FeedbackApiClient({ discoveryApi, fetchApi }),
    }),
});

/**
 * Full feedback admin page — lists all submitted feedback with filtering
 * and status triage. Registered at /feedback by default; override the
 * path via app-config.yaml under `app.extensions`.
 *
 * As of Backstage v1.51, NavItemBlueprint was removed — sidebar nav items
 * are now auto-discovered from page extensions based on their `title` and
 * `icon` params, so setting those here is what actually makes "Feedback"
 * show up in the sidebar. No separate nav-item extension is needed.
 */
const feedbackPage = PageBlueprint.make({
  name: 'page',
  params: {
    path: '/feedback',
    title: 'Feedback',
    icon: <FeedbackIcon />,
    loader: () =>
      import('./components/FeedbackPage').then(m => <m.FeedbackPage />),
  },
});

/**
 * An EntityCard that shows existing feedback for the current entity and
 * lets users submit new entity-scoped feedback. Shown automatically on
 * entity pages (any kind) once the plugin is installed; users can disable
 * it or restrict it to specific kinds via app-config.yaml app.extensions,
 * or by passing a `filter` param here.
 */
const entityFeedbackCard = EntityCardBlueprint.make({
  name: 'feedback-card',
  params: {
    loader: () =>
      import('./components/EntityFeedbackCard').then(m => (
        <m.EntityFeedbackCard />
      )),
  },
});

export const feedbackPlugin = createFrontendPlugin({
  pluginId: 'feedback',
  extensions: [
    feedbackApiExtension,
    feedbackPage,
    entityFeedbackCard,
    feedbackWidget,
  ],
});

export default feedbackPlugin;
