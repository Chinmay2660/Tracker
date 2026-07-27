import { JobSource } from '../types';

export const JOB_SOURCE_OPTIONS: { value: JobSource; label: string }[] = [
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'referral', label: 'Referral' },
    { value: 'recruiter', label: 'Recruiter' },
    { value: 'company_site', label: 'Company Site' },
    { value: 'job_board', label: 'Job Board' },
    { value: 'other', label: 'Other' },
];

export function getJobSourceLabel(source?: JobSource): string {
    if (!source) return '';
    return JOB_SOURCE_OPTIONS.find((o) => o.value === source)?.label ?? source;
}
