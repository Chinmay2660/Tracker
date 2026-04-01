import { HrCompanyType } from '../types';

export const HR_COMPANY_TYPE_LABELS: Record<HrCompanyType, string> = {
  consultancy: 'Consultancy (hires for other companies)',
  third_party_payroll: 'Third-party payroll',
  service_based: 'Service-based company',
  product_based: 'Product-based company',
};

export const HR_COMPANY_TYPE_OPTIONS: { value: HrCompanyType; label: string }[] = (
  Object.entries(HR_COMPANY_TYPE_LABELS) as [HrCompanyType, string][]
).map(([value, label]) => ({ value, label }));
