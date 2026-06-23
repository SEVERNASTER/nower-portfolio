import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useAuth,
  useUser,
} from '@clerk/clerk-react';

import { fetchAuthMe } from '../features/auth/authApi';

type AuthStatusContextValue = {
  loading: boolean;
  mustChangePassword: boolean;
  refresh: () => Promise<void>;
  clearMustChangePassword: () => void;
  applyMustChangePassword: (value: boolean) => void;
};

const AuthStatusContext = createContext<AuthStatusContextValue | null>(null);

export function AuthStatusProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded: clerkAuthLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setMustChangePassword(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();
      if (!token) {
        setMustChangePassword(false);
        return;
      }

      const { user: authUser } = await fetchAuthMe(token);
      setMustChangePassword(
        authUser.role !== "admin" && Boolean(authUser.must_change_password)
      );
    } catch {
      setMustChangePassword(false);
    } finally {
      setLoading(false);
    }
  }, [getToken, user]);

  useEffect(() => {
    if (!clerkAuthLoaded || !userLoaded) return;
    if (!user) {
      setMustChangePassword(false);
      setLoading(false);
      return;
    }
    refresh();
  }, [clerkAuthLoaded, userLoaded, user?.id, refresh]);

  const clearMustChangePassword = useCallback(() => {
    setMustChangePassword(false);
  }, []);

  const applyMustChangePassword = useCallback((value: boolean) => {
    setMustChangePassword(value);
  }, []);

  const value = useMemo(
    () => ({
      loading,
      mustChangePassword,
      refresh,
      clearMustChangePassword,
      applyMustChangePassword,
    }),
    [loading, mustChangePassword, refresh, clearMustChangePassword, applyMustChangePassword]
  );

  return (
    <AuthStatusContext.Provider value={value}>{children}</AuthStatusContext.Provider>
  );
}

export function useAuthStatus() {
  const ctx = useContext(AuthStatusContext);
  if (!ctx) {
    throw new Error("useAuthStatus debe usarse dentro de AuthStatusProvider");
  }
  return ctx;
}
