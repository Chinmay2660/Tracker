import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../lib/api';
import { getApiBaseUrl } from '../lib/apiBase';
import { HrContactShareStatus, PublicHrContactRecord } from '../types';

export const HR_CONTACT_SHARE_QUERY_KEY = ['hr-contacts', 'share'] as const;

export const useHrContactShare = () => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: HR_CONTACT_SHARE_QUERY_KEY,
        queryFn: async (): Promise<HrContactShareStatus> => {
            const response = await api.get('/hr-contacts/share');
            const share = response?.data?.share as HrContactShareStatus | undefined;
            if (!share || share.enabled === false) {
                return { enabled: false };
            }
            return share;
        },
        staleTime: 60 * 1000,
    });

    const enableMutation = useMutation({
        mutationFn: async (): Promise<HrContactShareStatus> => {
            const response = await api.post('/hr-contacts/share');
            const share = response?.data?.share as HrContactShareStatus | undefined;
            if (!share?.enabled) {
                throw new Error('Invalid response from server');
            }
            return share;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: HR_CONTACT_SHARE_QUERY_KEY });
            toast.success('Share link created');
        },
        onError: () => {
            toast.error('Failed to create share link');
        },
    });

    const revokeMutation = useMutation({
        mutationFn: async () => {
            await api.delete('/hr-contacts/share');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: HR_CONTACT_SHARE_QUERY_KEY });
            toast.success('Share link disabled');
        },
        onError: () => {
            toast.error('Failed to disable share link');
        },
    });

    return {
        share: query.data ?? { enabled: false as const },
        isLoading: query.isLoading,
        enableShare: enableMutation.mutateAsync,
        revokeShare: revokeMutation.mutateAsync,
        isEnabling: enableMutation.isPending,
        isRevoking: revokeMutation.isPending,
    };
};

export async function fetchPublicHrContacts(token: string): Promise<{
    hrContacts: PublicHrContactRecord[];
    total: number;
}> {
    const base = getApiBaseUrl();
    const response = await fetch(`${base}/public/hr-contacts/${encodeURIComponent(token)}`);
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        const message = typeof data?.error === 'string' ? data.error : 'Failed to load shared contacts';
        throw new Error(message);
    }
    return {
        hrContacts: data?.hrContacts ?? [],
        total: typeof data?.total === 'number' ? data.total : 0,
    };
}
