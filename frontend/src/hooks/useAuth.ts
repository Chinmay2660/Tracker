import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import api from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { User } from '../types';

export const useAuth = () => {
  const { setUser, token } = useAuthStore();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data.user;
    },
    enabled: !!token,
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
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      useAuthStore.getState().logout();
    },
  });

  return {
    user,
    isLoading,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
  };
};

