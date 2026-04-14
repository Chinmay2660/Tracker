import { create } from 'zustand';
import { User } from '../types';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const TOKEN_KEY = 'token';
const TOKEN_EXPIRY_KEY = 'token_expiry';
const isSessionExpired = (): boolean => {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiry)
        return true;
    return Date.now() > parseInt(expiry, 10);
};
const getValidToken = (): string | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token)
        return null;
    if (isSessionExpired()) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
        return null;
    }
    return token;
};
interface AuthState {
    user: User | null;
    token: string | null;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    logout: () => void;
    checkSessionExpiry: () => boolean;
    refreshSession: () => void;
}
export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: getValidToken(),
    setUser: (user) => set({ user }),
    setToken: (token) => {
        if (token) {
            const expiryTime = Date.now() + SESSION_DURATION_MS;
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
        }
        else {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(TOKEN_EXPIRY_KEY);
        }
        set({ token });
    },
    logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
        set({ user: null, token: null });
    },
    checkSessionExpiry: () => {
        if (isSessionExpired()) {
            get().logout();
            return true;
        }
        return false;
    },
    refreshSession: () => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            const expiryTime = Date.now() + SESSION_DURATION_MS;
            localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
        }
    },
}));
