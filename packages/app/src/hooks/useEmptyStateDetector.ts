import { useEffect, useRef, useState } from 'react';

/**
 * Known CSS class fragments and data-testid values that Backstage plugins
 * render when a page has no content to display.
 *
 * Extend this list if you find additional selectors in your plugins.
 */
const EMPTY_STATE_SELECTORS = [
  '[data-testid="no-results"]',
  '[class*="EmptyState"]',
  '[class*="emptyState"]',
  '[class*="empty-state"]',
  // TechDocs
  '[class*="TechDocs-emptyState"]',
  // Catalog
  '[data-testid="entity-not-found"]',
  // Generic MUI empty
  '[class*="MuiTypography"][class*="noEntities"]',
];

/**
 * Returns `true` when any known empty-state element is visible inside
 * the provided container ref.
 *
 * Uses a MutationObserver so it reacts to async content loads.
 */
export function useEmptyStateDetector(
  containerRef: React.RefObject<HTMLElement>,
): boolean {
  const [isEmpty, setIsEmpty] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const check = () => {
      const found = EMPTY_STATE_SELECTORS.some(
        sel => container.querySelector(sel) !== null,
      );
      setIsEmpty(found);
    };

    check();

    observerRef.current = new MutationObserver(check);
    observerRef.current.observe(container, {
      childList: true,
      subtree: true,
      attributes: false,
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [containerRef]);

  return isEmpty;
}