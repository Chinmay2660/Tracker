import { Building2 } from 'lucide-react';
import { HrContactRecord } from '../types';
import { cn } from '@/lib/utils';
import {
  HR_CONSULTANCY_CLIENT_CHIP_CLASS,
  HR_INTERMEDIARY_PLAIN_TEXT_CLASS,
  HR_THIRD_PARTY_CLIENT_CHIP_CLASS,
} from './hrCompanyTypes';

type HrContactCompanyChipsProps = {
  row: HrContactRecord;
  showBuildingIcon?: boolean;
  className?: string;
};

const plainCompanyClass =
  'min-w-0 max-w-full break-words font-medium leading-snug text-slate-900 dark:text-slate-100 [overflow-wrap:anywhere]';

/**
 * Company column: chip only on client name (orange for consultancy, blue for third-party payroll).
 * Agency / payroll company is plain text.
 */
export function HrContactCompanyChips({
  row,
  showBuildingIcon = true,
  className,
}: HrContactCompanyChipsProps) {
  const type = row.companyType;
  const mid = row.intermediaryCompanyName?.trim();
  const end = row.companyName?.trim();

  const singleFallback = (
    <span className={plainCompanyClass}>{end || mid || '—'}</span>
  );

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-1.5 gap-y-1 min-w-0 [overflow-wrap:anywhere]',
        className
      )}
    >
      {showBuildingIcon && (
        <Building2 className="h-4 w-4 shrink-0 self-center text-teal-600 dark:text-teal-400" aria-hidden />
      )}
      {type === 'consultancy' || type === 'third_party_payroll' ? (
        mid && end ? (
          <>
            <span className={HR_INTERMEDIARY_PLAIN_TEXT_CLASS}>{mid}</span>
            <span
              className="shrink-0 select-none leading-none text-slate-400 dark:text-slate-500 self-center"
              aria-hidden
            >
              →
            </span>
            <span
              className={
                type === 'consultancy' ? HR_CONSULTANCY_CLIENT_CHIP_CLASS : HR_THIRD_PARTY_CLIENT_CHIP_CLASS
              }
            >
              {end}
            </span>
          </>
        ) : (
          <span
            className={
              end
                ? type === 'consultancy'
                  ? HR_CONSULTANCY_CLIENT_CHIP_CLASS
                  : HR_THIRD_PARTY_CLIENT_CHIP_CLASS
                : mid
                  ? HR_INTERMEDIARY_PLAIN_TEXT_CLASS
                  : 'text-slate-500 dark:text-slate-400'
            }
          >
            {end || mid || '—'}
          </span>
        )
      ) : type === 'product_based' || type === 'service_based' ? (
        <span className={plainCompanyClass}>{end || '—'}</span>
      ) : (
        singleFallback
      )}
    </div>
  );
}
