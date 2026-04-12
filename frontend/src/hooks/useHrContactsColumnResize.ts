import { useRef, type Dispatch, type SetStateAction } from 'react';
import {
  HR_CONTACTS_COL_COUNT,
  HR_CONTACTS_MAX_SINGLE_COL_PX,
  HR_CONTACTS_MIN_COL_PX,
} from '../lib/hrContactsTable';

type DragState = {
  type: 'between' | 'lastRight';
  startX: number;
  startWidths: number[];
  leftIndex: number;
  pointerId: number;
};

export function useHrContactsColumnResize(
  colWidths: number[],
  setColWidths: Dispatch<SetStateAction<number[]>>
) {
  const columnDragRef = useRef<DragState | null>(null);

  const applyColumnDrag = (clientX: number) => {
    const d = columnDragRef.current;
    if (!d) return;
    const delta = clientX - d.startX;
    const sw = d.startWidths;
    if (d.type === 'between') {
      const i = d.leftIndex;
      const a = sw[i]!;
      const b = sw[i + 1]!;
      const total = a + b;
      let newA = a + delta;
      if (newA < HR_CONTACTS_MIN_COL_PX) newA = HR_CONTACTS_MIN_COL_PX;
      if (newA > total - HR_CONTACTS_MIN_COL_PX) newA = total - HR_CONTACTS_MIN_COL_PX;
      const newB = total - newA;
      setColWidths((prev) => {
        const next = [...prev];
        next[i] = newA;
        next[i + 1] = newB;
        return next;
      });
      return;
    }
    const last = HR_CONTACTS_COL_COUNT - 1;
    setColWidths((prev) => {
      const next = [...prev];
      const v = Math.max(
        HR_CONTACTS_MIN_COL_PX,
        Math.min(HR_CONTACTS_MAX_SINGLE_COL_PX, sw[last]! + delta)
      );
      next[last] = v;
      return next;
    });
  };

  const attachListeners = (
    startWidths: number[],
    payload: Omit<DragState, 'pointerId' | 'startWidths'>,
    pointerId: number
  ) => {
    columnDragRef.current = { ...payload, startWidths, pointerId };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const handleMove = (ev: PointerEvent) => {
      if (columnDragRef.current?.pointerId !== ev.pointerId) return;
      ev.preventDefault();
      applyColumnDrag(ev.clientX);
    };
    const endDrag = (ev: PointerEvent) => {
      if (columnDragRef.current?.pointerId !== ev.pointerId) return;
      columnDragRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', endDrag);
      document.removeEventListener('pointercancel', endDrag);
    };
    document.addEventListener('pointermove', handleMove, { passive: false });
    document.addEventListener('pointerup', endDrag);
    document.addEventListener('pointercancel', endDrag);
  };

  const beginResizeBetween = (leftIndex: number, e: React.PointerEvent) => {
    if (!e.isPrimary) return;
    e.preventDefault();
    e.stopPropagation();
    attachListeners(
      [...colWidths],
      { type: 'between', startX: e.clientX, leftIndex },
      e.pointerId
    );
  };

  const beginResizeLastRight = (e: React.PointerEvent) => {
    if (!e.isPrimary) return;
    e.preventDefault();
    e.stopPropagation();
    attachListeners(
      [...colWidths],
      { type: 'lastRight', startX: e.clientX, leftIndex: HR_CONTACTS_COL_COUNT - 1 },
      e.pointerId
    );
  };

  return { beginResizeBetween, beginResizeLastRight };
}
