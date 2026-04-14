import { HrCompanyType } from '../types';
type Row = {
    companyType?: HrCompanyType;
    companyName?: string;
    intermediaryCompanyName?: string;
};
export function formatHrContactCompanyDisplay(row: Row): string {
    const mid = row.intermediaryCompanyName?.trim();
    const end = row.companyName?.trim();
    if (row.companyType === 'consultancy' || row.companyType === 'third_party_payroll') {
        if (mid && end)
            return `${mid} → ${end}`;
        return end || mid || '—';
    }
    return end || '—';
}
