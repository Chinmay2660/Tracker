import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { commitLoggedInUser } from '../lib/sessionStorage';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        const session = searchParams.get('session');
        if (!session) {
            navigate('/login', { replace: true });
            return;
        }

        api.post('/auth/exchange', { session })
            .then(async (response) => {
                await commitLoggedInUser(
                    queryClient,
                    response.data.user,
                    response.data.session ?? session,
                );
                navigate('/dashboard', { replace: true });
            })
            .catch(() => {
                navigate('/login?error=auth_failed', { replace: true });
            });
    }, [searchParams, navigate, queryClient]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-lg">Completing authentication...</div>
        </div>
    );
}
