import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { User } from '../types';

export const useAuth = () => {
  const { setUser, token } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data.user;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data exists
  });

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  const loginMutation = useMutation({
    mutationFn: async () => {
      window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/google`;
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await api.post('/auth/logout');
      } catch (error) {
        // Even if logout API fails, clear local state
        console.error('Logout API error:', error);
      }
    },
    onSuccess: () => {
      // Clear auth store first
      useAuthStore.getState().logout();
      // Clear all query cache
      queryClient.clear();
      // Redirect to home page (landing page) - use replace to prevent back button issues
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

