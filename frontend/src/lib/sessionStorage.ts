import type { QueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import type { User } from '../types';

const SESSION_KEY = 'app-session';

export function persistSession(token: string) {
    sessionStorage.setItem(SESSION_KEY, token);
}

export function getPersistedSession(): string | null {
    return sessionStorage.getItem(SESSION_KEY);
}

export function clearPersistedSession() {
    sessionStorage.removeItem(SESSION_KEY);
}

export async function commitLoggedInUser(
    queryClient: QueryClient,
    loggedInUser: User,
    session?: string,
) {
    if (session) {
        persistSession(session);
    }
    await queryClient.cancelQueries({ queryKey: ['auth', 'me'] });
    queryClient.setQueryData(['auth', 'me'], loggedInUser);
    useAuthStore.getState().setUser(loggedInUser);
}
