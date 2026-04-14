export const HR_DATA_CELL_BORDER = 'border-r border-slate-200 dark:border-slate-800';

/** Data columns (Company, HR name, Phone, Email) — percentages, must sum to 100 */
export const HR_DATA_COL_WIDTH_PERCENT = [30, 20, 18, 32] as const;

export const HR_ACTIONS_COL_PX = 120;

export const HR_ACTIONS_HEAD_CLASS =
  'box-border px-2 py-2.5 text-left align-middle font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap';

/** Table header cell (no column-resize handle) */
export const HR_TH_BASE =
  `overflow-hidden px-3 py-3 pl-4 text-left align-middle font-semibold text-slate-700 dark:text-slate-200 ${HR_DATA_CELL_BORDER}`;

export function hrActionsBodyCellBg(isHovered: boolean): string {
  return isHovered ? 'bg-slate-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-900';
}
