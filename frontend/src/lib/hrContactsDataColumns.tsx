import type { ReactNode } from 'react';
import { Mail, Phone, User } from 'lucide-react';
import { HrContactRecord } from '../types';
import { HrContactCompanyChips } from './hrContactCompanyChips';
import { HR_DATA_CELL_BORDER, HR_ROW_TD_HOVER } from './hrContactsClasses';
import { mailtoHrefFromEmail, telHrefFromPhone } from './phoneNormalize';
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
            render: (row) => {
                const display = row.phone?.trim() || '';
                const tel = telHrefFromPhone(row.phone);
                return (<div className="flex items-center gap-1.5 min-w-0">
          <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden/>
          {tel ? (<a href={tel} className="min-w-0 break-words tabular-nums leading-snug font-medium text-teal-600 underline decoration-teal-600/40 underline-offset-2 hover:decoration-teal-600 dark:text-teal-400 dark:decoration-teal-400/40 py-0.5 -my-0.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40" aria-label={`Call ${display}`}>
                {display}
              </a>) : (<span className="min-w-0 break-words tabular-nums leading-snug">{display || '—'}</span>)}
        </div>);
            },
        },
        {
            title: 'Email',
            tdClass: td('text-slate-600 dark:text-slate-400'),
            render: (row) => {
                const display = row.email?.trim() || '';
                const mailto = mailtoHrefFromEmail(row.email);
                return (<div className="flex items-start gap-1.5 min-w-0">
          <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" aria-hidden/>
          {mailto ? (<a href={mailto} className="min-w-0 break-all leading-snug font-medium text-teal-600 underline decoration-teal-600/40 underline-offset-2 hover:decoration-teal-600 dark:text-teal-400 dark:decoration-teal-400/40 py-0.5 -my-0.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40" aria-label={`Email ${display}`}>
                {display}
              </a>) : (<span className="block min-w-0 break-all leading-snug">{display || '—'}</span>)}
        </div>);
            },
        },
    ];
}
