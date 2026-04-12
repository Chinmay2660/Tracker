export const HR_CONTACTS_COL_WIDTHS_KEY = 'tracker:hrContacts:colWidths';
export const HR_CONTACTS_COL_COUNT = 6;
/** Below ~104px, thead labels overflow into the next column in table-fixed layout */
export const HR_CONTACTS_MIN_COL_PX = 104;
export const HR_CONTACTS_MAX_SINGLE_COL_PX = 900;

export const DEFAULT_HR_CONTACT_COL_WIDTHS: readonly number[] = [200, 120, 148, 220, 168, 320];

export const HR_DATA_CELL_BORDER = 'border-r border-slate-200 dark:border-slate-800';
export const HR_ACTIONS_COL_PX = 96;
export const HR_ACTIONS_PANEL_BORDER = 'border-r-2 border-slate-300 dark:border-slate-600';
export const HR_ACTIONS_HEAD_CLASS =
  'box-border px-2 py-2.5 text-left align-middle font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap';

export const HR_TH_BASE =
  `relative overflow-hidden px-3 py-3 pl-4 pr-7 text-left align-middle font-semibold text-slate-700 dark:text-slate-200 ${HR_DATA_CELL_BORDER}`;

export const HR_RESIZE_HANDLE_CLASS =
  'absolute inset-y-0 right-0 z-20 w-3 cursor-col-resize touch-none select-none hover:bg-teal-500/25 active:bg-teal-500/40';

export function hrActionsBodyCellBg(isHovered: boolean): string {
  return isHovered ? 'bg-slate-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-900';
}

export function loadStoredHrContactColWidths(): number[] {
  const fallback = [...DEFAULT_HR_CONTACT_COL_WIDTHS];
  try {
    const raw = localStorage.getItem(HR_CONTACTS_COL_WIDTHS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length !== HR_CONTACTS_COL_COUNT) return fallback;
    return parsed.map((n, i) => {
      const v = Number(n);
      if (!Number.isFinite(v)) return fallback[i]!;
      return Math.max(
        HR_CONTACTS_MIN_COL_PX,
        Math.min(HR_CONTACTS_MAX_SINGLE_COL_PX, Math.round(v))
      );
    });
  } catch {
    return fallback;
  }
}
