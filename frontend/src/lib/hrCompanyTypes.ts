import { HrCompanyType } from '../types';

export const HR_COMPANY_TYPE_LABELS: Record<HrCompanyType, string> = {
  consultancy: 'HR Consultancy',
  third_party_payroll: 'Third-Party Payroll',
  service_based: 'Service-Based Company',
  product_based: 'Product-Based Company',
};

export const HR_COMPANY_TYPE_OPTIONS: { value: HrCompanyType; label: string }[] = (
  Object.entries(HR_COMPANY_TYPE_LABELS) as [HrCompanyType, string][]
).map(([value, label]) => ({ value, label }));
