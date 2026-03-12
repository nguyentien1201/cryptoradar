import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@cryptoradar/shared';
import api from '../lib/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          set({ user: data.user, accessToken: data.accessToken, isLoading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (email, password, name) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', { email, password, name });
          set({ user: data.user, accessToken: data.accessToken, isLoading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: () => {
        set({ user: null, accessToken: null });
        delete api.defaults.headers.common['Authorization'];
      },

      refreshUser: async () => {
        const { accessToken } = get();
        if (!accessToken) return;
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          const { data } = await api.get('/auth/me');
          set({ user: data });
        } catch {
          set({ user: null, accessToken: null });
        }
      },
    }),
    {
      name: 'cryptoradar-auth',
      partialize: (state) => ({ accessToken: state.accessToken, user: state.user }),
    },
  ),
);
