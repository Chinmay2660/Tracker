import type { ReactNode } from 'react';
import { Phone, User } from 'lucide-react';
import { HrContactRecord } from '../types';
import { HrContactCompanyChips } from './hrContactCompanyChips';
import { HR_DATA_CELL_BORDER, HR_ROW_TD_HOVER } from './hrContactsClasses';
export type HrContactsDataColumn = {
    title: string;
    tdClass: string;
    render: (row: HrContactRecord) => ReactNode;
};
const td = (extra: string) =>
    `min-w-0 break-words px-4 py-3 align-middle text-left [overflow-wrap:anywhere] ${HR_ROW_TD_HOVER} ${HR_DATA_CELL_BORDER} ${extra}`.trim();
export function getHrContactsDataColumns(): readonly HrContactsDataColumn[] {
    return [
        {
            title: 'Company',
            tdClass: td(''),
            render: (row) => <HrContactCompanyChips row={row}/>,
        },
        {
            title: 'HR name',
            tdClass: td('text-slate-800 dark:text-slate-200'),
            render: (row) => (<div className="flex items-center gap-1.5 min-w-0">
          <User className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden/>
          <span className="min-w-0 break-words leading-snug">{row.hrName?.trim() || '—'}</span>
        </div>),
        },
        {
            title: 'Phone',
            tdClass: td('text-slate-700 dark:text-slate-300'),
            render: (row) => (<div className="flex items-center gap-1.5 min-w-0">
          <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden/>
          <span className="min-w-0 break-words tabular-nums leading-snug">{row.phone?.trim() || '—'}</span>
        </div>),
        },
        {
            title: 'Email',
            tdClass: td('text-slate-600 dark:text-slate-400'),
            render: (row) => (<span className="block min-w-0 break-all leading-snug">{row.email ?? '—'}</span>),
        },
    ];
}
