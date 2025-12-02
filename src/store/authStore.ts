import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, ApiError } from '@/api/api';
import { LoginRequest, User } from '@/types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await apiService.login(credentials);
          set({ user, token, isLoading: false });
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
        set({ user: null, token: null, error: null });
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      checkAuth: async () => {
        const { token, user } = get();
        if (token && user) {
          try {
            // Re-establish credentials from stored token
            const credentials = atob(token).split(':');
            apiService.setCredentials(credentials[0], credentials[1]);
            
            // Verify auth is still valid
            await apiService.healthCheck();
          } catch (error) {
            // Auth is invalid, logout
            get().logout();
          }
        }
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
