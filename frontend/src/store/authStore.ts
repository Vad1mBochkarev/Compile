import { create } from 'zustand';
import { apiClient } from '../api/client';

interface AuthUser {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profile: {
    id: string;
    user_id: string;
    display_name: string | null;
    bio: string | null;
    avatar_url: string | null;
    website: string | null;
    github: string | null;
    created_at: string;
    updated_at: string;
  } | null;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.login(email, password);
      await get().loadUser();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Ошибка входа' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.register(email, password);
      await get().login(email, password);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Ошибка регистрации' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    apiClient.logout();
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const user = await apiClient.getMe();
      set({ user, isAuthenticated: true, error: null });
    } catch {
      set({ user: null, isAuthenticated: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
