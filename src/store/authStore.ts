import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, ApiError } from '@/api/api';
import { LoginRequest, User, ShopConfigurations, VendorConfiguration } from '@/types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  configurations: ShopConfigurations | null;
  configList: VendorConfiguration[];
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
  fetchConfigurations: () => Promise<void>;
  updateConfiguration: (key: string, is_enabled: boolean) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      configurations: null,
      configList: [],
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token, configurations } = await apiService.login(credentials);
          set({ user, token, configurations: configurations ?? null, isLoading: false });
        } catch (error) {
          apiService.clearCredentials();
          if (error instanceof ApiError) {
            set({ 
              error: error.message, 
              isLoading: false,
              user: null,
              token: null 
            });
          } else {
            set({ 
              error: 'Login failed. Please try again.', 
              isLoading: false,
              user: null,
              token: null 
            });
          }
        }
      },
      
      logout: () => {
        apiService.clearCredentials();
        set({ user: null, token: null, configurations: null, configList: [], error: null });
      },

      clearError: () => {
        set({ error: null });
      },

      checkAuth: async () => {
        const { token, user } = get();
        if (token && user) {
          try {
            const credentials = atob(token).split(':');
            apiService.setCredentials(credentials[0], credentials[1]);

            const healthData = await apiService.healthCheck();
            set({ configurations: healthData.configurations ?? null });
          } catch (error) {
            get().logout();
          }
        }
      },

      fetchConfigurations: async () => {
        try {
          const list = await apiService.getConfigurations();
          const dict = list.reduce((acc, cfg) => {
            acc[cfg.key] = { label: cfg.label, type: cfg.type, is_enabled: cfg.is_enabled };
            return acc;
          }, {} as ShopConfigurations);
          set({ configList: list, configurations: dict });
        } catch {
          // silently fail — existing configurations in store remain
        }
      },

      updateConfiguration: async (key, is_enabled) => {
        // optimistic update
        set((state) => ({
          configList: state.configList.map((c) =>
            c.key === key ? { ...c, is_enabled, value: { ...c.value, is_enabled } } : c
          ),
          configurations: state.configurations
            ? {
                ...state.configurations,
                [key]: state.configurations[key]
                  ? { ...state.configurations[key]!, is_enabled }
                  : undefined,
              }
            : state.configurations,
        }));

        const updated = await apiService.updateConfiguration(key, is_enabled);

        // confirm with server response
        set((state) => ({
          configList: state.configList.map((c) =>
            c.key === key ? { ...c, is_enabled: updated.is_enabled, value: updated.value } : c
          ),
          configurations: state.configurations
            ? {
                ...state.configurations,
                [key]: state.configurations[key]
                  ? { ...state.configurations[key]!, is_enabled: updated.is_enabled }
                  : undefined,
              }
            : state.configurations,
        }));
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token 
      }),
    }
  )
);
