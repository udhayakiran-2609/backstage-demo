import { createExtensionTester, renderInTestApp } from '@backstage/frontend-test-utils';
import feedbackPlugin from '../src/plugin';

// Run with: yarn start (backstage-cli package start)
// createExtensionTester takes a single extension, not a whole plugin, so
// we pull the page extension out to preview it standalone against the
// real backend at http://localhost:7007 (make sure feedback-backend is
// running too). For a fuller preview including the entity card and
// floating widget, swap pageExtension for entityFeedbackCard / feedbackWidget
// from src/plugin.tsx, or use .add() to combine multiple extensions —
// see https://backstage.io/docs/frontend-system/building-plugins/testing/
const pageExtension = feedbackPlugin.getExtension('page:feedback/page');

renderInTestApp(createExtensionTester(pageExtension).reactElement());
