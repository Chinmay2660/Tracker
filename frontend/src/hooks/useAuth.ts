import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { User } from '../types';
import { getApiBaseUrl } from '../lib/apiBase';
export const useAuth = () => {
    const { setUser, token } = useAuthStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: user, isLoading } = useQuery<User>({
        queryKey: ['auth', 'me'],
        queryFn: async () => {
            try {
                const response = await api.get('/auth/me');
                return response?.data?.user;
            }
            catch (error: any) {
                if (error?.response?.status !== 401) {
                    const errorMessage = error?.response?.data?.message ?? error?.message ?? 'Failed to fetch user';
                    toast.error('Error loading user', {
                        description: errorMessage,
                    });
                }
                throw error;
            }
        },
        enabled: !!token,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });
    useEffect(() => {
        if (user) {
            setUser(user);
        }
    }, [user, setUser]);
    const loginMutation = useMutation({
        mutationFn: async () => {
            window.location.href = `${getApiBaseUrl()}/auth/google`;
        },
    });
    const logoutMutation = useMutation({
        mutationFn: async () => {
            try {
                await api.post('/auth/logout');
            }
            catch (error: any) {
                const errorMessage = error?.response?.data?.message ?? error?.message;
                if (errorMessage) {
                    toast.error('Logout error', {
                        description: errorMessage,
                    });
                }
            }
        },
        onSuccess: () => {
            useAuthStore.getState().logout();
            queryClient.clear();
            navigate('/', { replace: true });
        },
    });
    return {
        user,
        isLoading,
        login: loginMutation.mutate,
        logout: logoutMutation.mutate,
    };
};
