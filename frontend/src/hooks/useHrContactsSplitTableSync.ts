import { useCallback, useLayoutEffect, useRef } from 'react';

/**
 * Keeps the fixed Actions table row heights in sync with the scrolling data table.
 */
export function useHrContactsSplitTableSync(syncKey: string) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const dataTableRef = useRef<HTMLTableElement>(null);
  const actionsTableRef = useRef<HTMLTableElement>(null);

  const syncHeights = useCallback(() => {
    const data = dataTableRef.current;
    const actions = actionsTableRef.current;
    if (!data || !actions) return;
    const dataRows = data.querySelectorAll('thead tr, tbody tr');
    const actionRows = actions.querySelectorAll('thead tr, tbody tr');
    if (dataRows.length === 0 || dataRows.length !== actionRows.length) return;
    for (let i = 0; i < dataRows.length; i++) {
      const source = dataRows[i] as HTMLElement;
      const target = actionRows[i] as HTMLElement;
      const targetCell = target.querySelector('th, td') as HTMLElement | null;
      const h = Math.round(source.getBoundingClientRect().height);
      const px = `${h}px`;
      target.style.height = px;
      target.style.minHeight = px;
      target.style.boxSizing = 'border-box';
      if (targetCell) {
        targetCell.style.height = px;
        targetCell.style.minHeight = px;
        targetCell.style.boxSizing = 'border-box';
      }
    }
  }, []);

  useLayoutEffect(() => {
    let cancelled = false;
    const run = () => {
      if (!cancelled) syncHeights();
    };
    const schedule = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(run);
      });
    };
    schedule();
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      void document.fonts.ready.then(() => {
        if (!cancelled) schedule();
      });
    }
    const scrollEl = scrollAreaRef.current;
    const dt = dataTableRef.current;
    const at = actionsTableRef.current;
    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            if (!cancelled) schedule();
          })
        : null;
    if (scrollEl) ro?.observe(scrollEl);
    if (dt) ro?.observe(dt);
    if (at) ro?.observe(at);
    window.addEventListener('resize', schedule);
    return () => {
      cancelled = true;
      ro?.disconnect();
      window.removeEventListener('resize', schedule);
    };
  }, [syncHeights, syncKey]);

  return { scrollAreaRef, dataTableRef, actionsTableRef };
}
