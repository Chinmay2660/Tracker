import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../lib/api';
import { HrContactRecord, HrCompanyType } from '../types';

export const HR_CONTACTS_QUERY_KEY = ['hr-contacts'] as const;

export const HR_CONTACTS_PAGE_SIZES = [5, 10, 15, 20] as const;
export type HrContactsPageSize = (typeof HR_CONTACTS_PAGE_SIZES)[number];
export const HR_CONTACTS_DEFAULT_PAGE_SIZE = 10 satisfies HrContactsPageSize;

export type HrContactInput = {
    companyName: string;
    intermediaryCompanyName: string;
    hrName: string;
    phone: string;
    email?: string;
    noticePeriodLwdNote?: string;
    companyType?: HrCompanyType;
    shareable?: boolean;
};

export type UseHrContactsOptions =
    | { paginate?: false }
    | { paginate: true; page: number; pageSize: HrContactsPageSize };

type HrContactsPagedResponse = {
    hrContacts: HrContactRecord[];
    total: number;
    page: number;
    limit: HrContactsPageSize;
    totalPages: number;
};

export const useHrContacts = (options?: UseHrContactsOptions) => {
    const queryClient = useQueryClient();
    const paginate = options?.paginate === true;
    const page = paginate ? Math.max(1, options?.page ?? 1) : 1;
    const pageSize = paginate ? (options?.pageSize ?? HR_CONTACTS_DEFAULT_PAGE_SIZE) : HR_CONTACTS_DEFAULT_PAGE_SIZE;

    const query = useQuery({
        queryKey: paginate
            ? [...HR_CONTACTS_QUERY_KEY, 'paged', page, pageSize]
            : [...HR_CONTACTS_QUERY_KEY, 'all'],
        queryFn: async (): Promise<HrContactRecord[] | HrContactsPagedResponse> => {
            if (paginate) {
                const response = await api.get('/hr-contacts', {
                    params: { page, limit: pageSize },
                });
                const d = response?.data;
                return {
                    hrContacts: d?.hrContacts ?? [],
                    total: typeof d?.total === 'number' ? d.total : 0,
                    page: typeof d?.page === 'number' ? d.page : page,
                    limit: (d?.limit ?? pageSize) as HrContactsPageSize,
                    totalPages: typeof d?.totalPages === 'number' ? d.totalPages : 1,
                };
            }
            const response = await api.get('/hr-contacts', { params: { all: 'true' } });
            return response?.data?.hrContacts ?? [];
        },
        staleTime: 2 * 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });

    const data = query.data;
    const hrContacts: HrContactRecord[] = Array.isArray(data)
        ? data
        : data && typeof data === 'object' && 'hrContacts' in data
          ? (data as HrContactsPagedResponse).hrContacts
          : [];

    const pagedMeta =
        paginate && data && typeof data === 'object' && 'total' in data
            ? {
                  total: (data as HrContactsPagedResponse).total,
                  page: (data as HrContactsPagedResponse).page,
                  pageSize: (data as HrContactsPagedResponse).limit,
                  totalPages: (data as HrContactsPagedResponse).totalPages,
              }
            : undefined;

    const createMutation = useMutation({
        mutationFn: async (input: HrContactInput) => {
            const response = await api.post('/hr-contacts', input);
            const hrContact = response?.data?.hrContact as HrContactRecord | undefined;
            if (!hrContact) {
                throw new Error('Invalid response from server');
            }
            return hrContact;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: HR_CONTACTS_QUERY_KEY });
            toast.success('HR contact saved');
        },
        onError: (error: {
            response?: {
                data?: {
                    error?: unknown;
                };
            };
            message?: string;
        }) => {
            const raw = error?.response?.data?.error;
            const msg = typeof raw === 'string' ? raw : error?.message ?? 'Failed to save HR contact';
            toast.error(msg);
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, ...data }: { id: string } & Partial<HrContactInput>) => {
            const response = await api.put(`/hr-contacts/${id}`, data);
            const hrContact = response?.data?.hrContact as HrContactRecord | undefined;
            if (!hrContact) {
                throw new Error('Invalid response from server');
            }
            return hrContact;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: HR_CONTACTS_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ['interviews'] });
            toast.success('HR contact updated');
        },
        onError: (error: {
            response?: {
                data?: {
                    error?: string;
                };
            };
            message?: string;
        }) => {
            const msg = error?.response?.data?.error ?? error?.message ?? 'Failed to update HR contact';
            toast.error(typeof msg === 'string' ? msg : 'Failed to update HR contact');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/hr-contacts/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: HR_CONTACTS_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ['interviews'] });
            toast.success('HR contact removed');
        },
        onError: () => {
            toast.error('Failed to delete HR contact');
        },
    });

    return {
        hrContacts,
        total: pagedMeta?.total,
        page: pagedMeta?.page,
        pageSize: pagedMeta?.pageSize,
        totalPages: pagedMeta?.totalPages,
        isLoading: query.isLoading,
        refetch: query.refetch,
        createHrContact: createMutation.mutateAsync,
        updateHrContact: updateMutation.mutateAsync,
        deleteHrContact: deleteMutation.mutateAsync,
        isSaving: createMutation.isPending || updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
};
