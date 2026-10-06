import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { getApiBaseUrl } from './apiBase';
import { clearPersistedSession, getPersistedSession } from './sessionStorage';

const API_URL = getApiBaseUrl();

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const session = getPersistedSession();
    if (session) {
        config.headers.set('Authorization', `Bearer ${session}`);
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url ?? '';
        const isAuthMe = url.includes('/auth/me');
        if (error.response?.status === 401 && !isAuthMe) {
            clearPersistedSession();
            useAuthStore.getState().logout();
            if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/auth/callback')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
