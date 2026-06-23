import { useEffect, useRef, useState } from 'react';

/**
 * CSS selectors that Backstage plugins render when a page has no content.
 * Add more here if you find other empty-state patterns in your plugins.
 */
const EMPTY_STATE_SELECTORS = [
  // Generic
  '[data-testid="no-results"]',
  '[data-testid="empty-state"]',
  // Class name fragments (MUI class-name hashing means we match substrings)
  '[class*="EmptyState"]',
  '[class*="emptyState"]',
  '[class*="empty-state"]',
  // Catalog plugin
  '[data-testid="entity-not-found"]',
  // Notifications plugin
  '[class*="notificationsEmpty"]',
];

/**
 * Returns true when any known empty-state element is visible inside
 * the provided container ref. Uses a MutationObserver to react to
 * async content loads (e.g. after data fetching).
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