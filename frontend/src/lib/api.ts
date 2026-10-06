import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { getApiBaseUrl } from './apiBase';

const API_URL = getApiBaseUrl();

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url ?? '';
        const isAuthMe = url.includes('/auth/me');
        if (error.response?.status === 401 && !isAuthMe) {
            useAuthStore.getState().logout();
            if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/auth/callback')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
