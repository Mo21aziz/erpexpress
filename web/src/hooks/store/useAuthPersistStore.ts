// src/hooks/store/useAuthPersistStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  [x: string]: any;
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
}

export const useAuthPersistStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: true, // Default to true for testing
      setAuthenticated: (value) => set({ isAuthenticated: value }),
    }),
    {
      name: 'auth-storage',
    }
  )
);