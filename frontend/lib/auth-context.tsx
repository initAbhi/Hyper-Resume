'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, User, ApiError } from './api-client';
import { logger } from './logger';

const authLogger = logger.child('Auth');

interface AuthContextType {
  user: User | null;
  creditBalance: number;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  signup: (credentials: { email: string; password: string; fullName: string }) => Promise<void>;
  googleLogin: (payload: {
    credential: string;
    targetRole?: string;
    targetGoal?: string;
    experienceLevel?: string;
  }) => Promise<{ isNewUser?: boolean }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const data = await apiClient.getMe();
      setUser(data.user);
      setCreditBalance(data.creditBalance || 0);
      authLogger.debug('User session refreshed', { userId: data.user.id, credits: data.creditBalance });
    } catch (err: unknown) {
      if (err instanceof ApiError && err.statusCode === 401) {
        authLogger.debug('Session expired, clearing tokens');
        apiClient.setToken(null);
        setUser(null);
        setCreditBalance(0);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .getMe()
      .then((data) => {
        if (isMounted) {
          setUser(data.user);
          setCreditBalance(data.creditBalance || 0);
          authLogger.debug('Initial session authenticated', { userId: data.user.id });
        }
      })
      .catch((err: unknown) => {
        if (isMounted && err instanceof ApiError && err.statusCode === 401) {
          apiClient.setToken(null);
          setUser(null);
          setCreditBalance(0);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const data = await apiClient.login(credentials);
      setUser(data.user);
      authLogger.info('User login successful', { email: credentials.email, userId: data.user.id });
      await refreshUser();
    } catch (err) {
      authLogger.warn('User login failed', { email: credentials.email });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (credentials: { email: string; password: string; fullName: string }) => {
    setIsLoading(true);
    try {
      const data = await apiClient.signup(credentials);
      setUser(data.user);
      authLogger.info('User signup successful', { email: credentials.email, userId: data.user.id });
      await refreshUser();
    } catch (err) {
      authLogger.warn('User signup failed', { email: credentials.email });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (payload: {
    credential: string;
    targetRole?: string;
    targetGoal?: string;
    experienceLevel?: string;
  }) => {
    setIsLoading(true);
    try {
      const data = await apiClient.googleAuth(payload);
      setUser(data.user);
      authLogger.info('Google authentication successful', { userId: data.user.id, isNewUser: data.isNewUser });
      await refreshUser();
      return { isNewUser: data.isNewUser };
    } catch (err) {
      authLogger.warn('Google authentication failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiClient.logout();
      authLogger.info('User logged out');
    } catch {
      // Ignore API failure on logout
    } finally {
      setUser(null);
      setCreditBalance(0);
      setIsLoading(false);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        creditBalance,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        googleLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
