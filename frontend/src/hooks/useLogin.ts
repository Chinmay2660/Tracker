import { useMutation } from '@tanstack/react-query';
import { getApiBaseUrl } from '../lib/apiBase';

/**
 * Lightweight login hook that only handles the login redirect.
 * Does NOT call any APIs - use this on public pages like LoginPage.
 */
export const useLogin = () => {
  const loginMutation = useMutation({
    mutationFn: async () => {
      window.location.href = `${getApiBaseUrl()}/auth/google`;
    },
  });

  return {
    login: loginMutation.mutate,
    isLoading: loginMutation.isPending,
  };
};

