import { HrCompanyType } from '../types';

type Row = {
  companyType?: HrCompanyType;
  companyName?: string;
  intermediaryCompanyName?: string;
};

/** Single line for table / dropdowns: shows agency → client when both exist for consultancy or payroll. */
export function formatHrContactCompanyDisplay(row: Row): string {
  const mid = row.intermediaryCompanyName?.trim();
  const end = row.companyName?.trim();
  if (row.companyType === 'consultancy' || row.companyType === 'third_party_payroll') {
    if (mid && end) return `${mid} → ${end}`;
    return end || mid || '—';
  }
  return end || '—';
}
