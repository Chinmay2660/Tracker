import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { User } from '../types';
import { getApiBaseUrl } from '../lib/apiBase';

export const useAuth = () => {
    const { setUser } = useAuthStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: user, isPending, isFetched, isError } = useQuery<User | null>({
        queryKey: ['auth', 'me'],
        queryFn: async () => {
            try {
                const response = await api.get('/auth/me');
                return response?.data?.user ?? null;
            } catch (error: any) {
                if (error?.response?.status === 401) return null;
                throw error;
            }
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: false,
    });

    useEffect(() => {
        setUser(user ?? null);
    }, [user, setUser]);

    const loginWithGoogle = (returnTo?: string) => {
        const base = `${getApiBaseUrl()}/auth/google`;
        window.location.href = returnTo ? `${base}?returnTo=${encodeURIComponent(returnTo)}` : base;
    };

    const loginWithCode = async (username: string, code: string) => {
        const response = await api.post('/auth/login', { username, code });
        const loggedInUser = response.data.user as User;
        queryClient.setQueryData(['auth', 'me'], loggedInUser);
        setUser(loggedInUser);
        return loggedInUser;
    };

    const registerWithCode = async (payload: { username: string; name: string; code: string }) => {
        const response = await api.post('/auth/register', payload);
        const registeredUser = response.data.user as User;
        queryClient.setQueryData(['auth', 'me'], registeredUser);
        setUser(registeredUser);
        return registeredUser;
    };

    const loginAsGuest = async () => {
        const response = await api.post('/auth/guest');
        const guestUser = response.data.user as User;
        queryClient.setQueryData(['auth', 'me'], guestUser);
        setUser(guestUser);
        return guestUser;
    };

    const logoutMutation = useMutation({
        mutationFn: async () => {
            try {
                await api.post('/auth/logout');
            }
            catch (error: any) {
                const errorMessage = error?.response?.data?.error ?? error?.message;
                if (errorMessage) {
                    toast.error('Logout error', { description: errorMessage });
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
        user: user ?? null,
        isLoading: isPending,
        isFetched: isFetched || isError,
        loginWithGoogle,
        loginWithCode,
        registerWithCode,
        loginAsGuest,
        logout: logoutMutation.mutate,
    };
};
