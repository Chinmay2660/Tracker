import type { ReactNode } from 'react';
import { Building2, Phone, User } from 'lucide-react';
import { HrContactRecord } from '../types';
import { HR_COMPANY_TYPE_LABELS } from './hrCompanyTypes';
import { formatHrContactCompanyDisplay } from './hrContactDisplay';
import { HR_DATA_CELL_BORDER } from './hrContactsTable';

export type HrContactsDataColumn = {
  title: string;
  /** aria-label on the resize control at the right edge of this header */
  ariaResize: string;
  tdClass: string;
  render: (row: HrContactRecord) => ReactNode;
};

const td = (extra: string) =>
  `min-w-0 overflow-hidden px-4 py-3 align-middle text-left ${HR_DATA_CELL_BORDER} ${extra}`.trim();

export const HR_CONTACTS_DATA_COLUMNS: readonly HrContactsDataColumn[] = [
  {
    title: 'Company',
    ariaResize: 'Resize columns: Company and Type',
    tdClass: td(''),
    render: (row) => (
      <div className="flex items-center gap-2 min-w-0 overflow-hidden">
        <Building2 className="h-4 w-4 flex-shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
        <span className="font-medium text-slate-900 dark:text-white break-words min-w-0">
          {formatHrContactCompanyDisplay(row)}
        </span>
      </div>
    ),
  },
  {
    title: 'Type',
    ariaResize: 'Resize columns: Type and Name',
    tdClass: td('whitespace-nowrap'),
    render: (row) => (
      <span className="inline-flex max-w-full truncate text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
        {row.companyType ? HR_COMPANY_TYPE_LABELS[row.companyType] : '—'}
      </span>
    ),
  },
  {
    title: 'Name',
    ariaResize: 'Resize columns: Name and Email',
    tdClass: td('text-slate-800 dark:text-slate-200'),
    render: (row) => (
      <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
        <User className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" aria-hidden />
        <span className="min-w-0 truncate">{row.hrName?.trim() || '—'}</span>
      </div>
    ),
  },
  {
    title: 'Email',
    ariaResize: 'Resize columns: Email and Phone',
    tdClass: td('text-slate-600 dark:text-slate-400'),
    render: (row) => (
      <span className="block min-w-0 truncate" title={row.email ?? undefined}>
        {row.email ?? '—'}
      </span>
    ),
  },
  {
    title: 'Phone',
    ariaResize: 'Resize columns: Phone and Notice',
    tdClass: td('text-slate-700 dark:text-slate-300'),
    render: (row) => (
      <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
        <Phone className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" aria-hidden />
        <span className="min-w-0 truncate whitespace-nowrap tabular-nums">{row.phone?.trim() || '—'}</span>
      </div>
    ),
  },
  {
    title: 'Notice / LWD',
    ariaResize: 'Resize Notice column from the right',
    tdClass: td('text-slate-600 dark:text-slate-400'),
    render: (row) =>
      row.noticePeriodLwdNote ? (
        <span
          className="line-clamp-2 min-w-0 break-words [overflow-wrap:anywhere]"
          title={row.noticePeriodLwdNote}
        >
          {row.noticePeriodLwdNote}
        </span>
      ) : (
        <span className="text-slate-400 dark:text-slate-500">—</span>
      ),
  },
];
