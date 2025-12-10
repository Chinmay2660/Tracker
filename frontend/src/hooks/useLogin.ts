import { useMutation } from '@tanstack/react-query';

/**
 * Lightweight login hook that only handles the login redirect.
 * Does NOT call any APIs - use this on public pages like LoginPage.
 */
export const useLogin = () => {
  const loginMutation = useMutation({
    mutationFn: async () => {
      window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/google`;
    },
  });

  return {
    login: loginMutation.mutate,
    isLoading: loginMutation.isPending,
  };
};

