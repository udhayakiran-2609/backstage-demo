// packages/app/src/components/TopNav/NavbarContentShim.tsx
//
// This patches the Backstage content wrapper so pages don't hide
// behind the fixed 56px navbar. Uses MutationObserver so it works
// even as Backstage mounts its own layout elements after render.

import { useEffect } from 'react';

const NAV_HEIGHT = 56; // must match TopNavBar height

const CONTENT_SELECTORS = [
  // Backstage new frontend system content wrappers
  'main[class*="BackstagePage"]',
  'div[class*="BackstageContent"]',
  'div[class*="MuiBox-root"]:not([class*="sidebar"])',
  // Legacy backstage layout
  '.backstage-layout > main',
  // fallback: body direct child wrappers
  '#root > div > main',
];

function applyPaddingFix() {
  for (const sel of CONTENT_SELECTORS) {
    const el = document.querySelector<HTMLElement>(sel);
    if (el) {
      el.style.paddingTop = `${NAV_HEIGHT}px`;
      return; // stop at first match
    }
  }
}

export function NavbarContentShim() {
  useEffect(() => {
    applyPaddingFix();

    const observer = new MutationObserver(() => {
      applyPaddingFix();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
