import { useMutation } from '@tanstack/react-query';
import { getApiBaseUrl } from '../lib/apiBase';
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
