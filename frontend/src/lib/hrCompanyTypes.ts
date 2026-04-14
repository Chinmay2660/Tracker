import { HrCompanyType } from '../types';

export const HR_COMPANY_TYPE_LABELS: Record<HrCompanyType, string> = {
  consultancy: 'HR Consultancy',
  third_party_payroll: 'Third-Party Payroll',
  service_based: 'Service-Based Company',
  product_based: 'Product-Based Company',
};

/** Short labels for compact chips in tables and summaries */
export const HR_COMPANY_TYPE_SHORT_LABEL: Record<HrCompanyType, string> = {
  consultancy: 'Consultancy',
  third_party_payroll: 'Third party',
  service_based: 'Service',
  product_based: 'Product',
};

const badgeBase =
  'inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-tight';

/** Colored type chip (Product, Service, Third party, Consultancy) */
export const HR_COMPANY_TYPE_BADGE_CLASS: Record<HrCompanyType, string> = {
  product_based: `${badgeBase} border-violet-300/90 bg-violet-100 text-violet-900 dark:border-violet-700 dark:bg-violet-950/55 dark:text-violet-200`,
  service_based: `${badgeBase} border-sky-300/90 bg-sky-100 text-sky-950 dark:border-sky-700 dark:bg-sky-950/50 dark:text-sky-100`,
  third_party_payroll: `${badgeBase} border-amber-300/90 bg-amber-100 text-amber-950 dark:border-amber-800 dark:bg-amber-950/45 dark:text-amber-100`,
  consultancy: `${badgeBase} border-indigo-300/90 bg-indigo-100 text-indigo-950 dark:border-indigo-700 dark:bg-indigo-950/55 dark:text-indigo-100`,
};

const segChipBase =
  'inline-flex min-w-0 max-w-full items-center break-words rounded-md text-xs font-semibold shadow-sm [overflow-wrap:anywhere]';

/** Plain line for agency / payroll company (no chip; client uses chip below) */
export const HR_INTERMEDIARY_PLAIN_TEXT_CLASS =
  'text-sm font-medium text-slate-800 dark:text-slate-200 break-words [overflow-wrap:anywhere]';

/**
 * Client company chip — HR consultancy (orange).
 * Light: soft fill + dark text; dark: brighter fill + white text for contrast on slate UIs.
 */
export const HR_CONSULTANCY_CLIENT_CHIP_CLASS =
  `${segChipBase} px-2.5 py-1.5 border border-orange-300/90 bg-orange-100 text-orange-950 dark:border-orange-400/70 dark:bg-orange-500 dark:text-white`;

/**
 * Client company chip — third-party payroll (blue).
 * Light: sky tint; dark: vivid sky with white label text.
 */
export const HR_THIRD_PARTY_CLIENT_CHIP_CLASS =
  `${segChipBase} px-2.5 py-1.5 border border-sky-300/90 bg-sky-100 text-sky-950 dark:border-sky-400/70 dark:bg-sky-500 dark:text-white`;

/** Company name chip for product / service single-company rows (tinted by type) */
export const HR_COMPANY_NAME_CHIP_CLASS: Record<HrCompanyType, string> = {
  product_based:
    'inline-flex min-w-0 max-w-full break-words rounded-md border border-violet-300/80 bg-violet-100/85 px-2 py-0.5 text-xs font-medium text-violet-950 shadow-sm dark:border-violet-700/80 dark:bg-violet-950/40 dark:text-violet-100',
  service_based:
    'inline-flex min-w-0 max-w-full break-words rounded-md border border-sky-300/80 bg-sky-100/85 px-2 py-0.5 text-xs font-medium text-sky-950 shadow-sm dark:border-sky-700/80 dark:bg-sky-950/40 dark:text-sky-50',
  third_party_payroll:
    'inline-flex min-w-0 max-w-full break-words rounded-md border border-amber-300/80 bg-amber-100/85 px-2 py-0.5 text-xs font-medium text-amber-950 shadow-sm dark:border-amber-700/80 dark:bg-amber-950/40 dark:text-amber-50',
  consultancy:
    'inline-flex min-w-0 max-w-full break-words rounded-md border border-indigo-300/80 bg-indigo-100/85 px-2 py-0.5 text-xs font-medium text-indigo-950 shadow-sm dark:border-indigo-700/80 dark:bg-indigo-950/40 dark:text-indigo-50',
};

export const HR_COMPANY_TYPE_OPTIONS: { value: HrCompanyType; label: string }[] = (
  Object.entries(HR_COMPANY_TYPE_LABELS) as [HrCompanyType, string][]
).map(([value, label]) => ({ value, label }));
