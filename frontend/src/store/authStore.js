import { create } from 'zustand';
import api from '../lib/api';

/**
 * Auth store — manages user session, tokens, login/logout.
 */
const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  /**
   * Hydrate auth state from localStorage on app load.
   */
  hydrate: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, accessToken: token, isAuthenticated: true, isLoading: false });
      } catch {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  /**
   * Login — stores tokens and user info.
   */
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true });
    return data;
  },

  /**
   * Register — creates account and auto-logs in.
   */
  register: async (name, email, password, role = 'student') => {
    const { data } = await api.post('/auth/register', { name, email, password, role });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true });
    return data;
  },

  /**
   * Logout — clears tokens and state.
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout API errors
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  /**
   * Set new access token (used by interceptor on refresh).
   */
  setAccessToken: (token) => {
    localStorage.setItem('accessToken', token);
    set({ accessToken: token });
  },
}));

export default useAuthStore;
