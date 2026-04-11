import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../lib/api';
import { HrContactRecord, HrCompanyType } from '../types';

export const HR_CONTACTS_QUERY_KEY = ['hr-contacts'] as const;

export type HrContactInput = {
  companyName: string;
  intermediaryCompanyName: string;
  hrName: string;
  phone: string;
  email?: string;
  noticePeriodLwdNote?: string;
  companyType?: HrCompanyType;
};

export const useHrContacts = () => {
  const queryClient = useQueryClient();

  const query = useQuery<HrContactRecord[]>({
    queryKey: HR_CONTACTS_QUERY_KEY,
    queryFn: async () => {
      const response = await api.get('/hr-contacts');
      return response?.data?.hrContacts ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: HrContactInput) => {
      const response = await api.post('/hr-contacts', data);
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
    onError: (error: { response?: { data?: { error?: unknown } }; message?: string }) => {
      const raw = error?.response?.data?.error;
      const msg =
        typeof raw === 'string' ? raw : error?.message ?? 'Failed to save HR contact';
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
    onError: (error: { response?: { data?: { error?: string } }; message?: string }) => {
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
    hrContacts: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    createHrContact: createMutation.mutateAsync,
    updateHrContact: updateMutation.mutateAsync,
    deleteHrContact: deleteMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
