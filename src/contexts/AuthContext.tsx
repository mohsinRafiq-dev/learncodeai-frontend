import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../services/api';
import { STORAGE_KEYS } from '../constants';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  accountStatus: "active" | "suspended" | "pending";
  isEmailVerified: boolean;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

interface SignupResult {
  needsVerification: boolean;
  email?: string;
  isResend?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, confirmPassword: string) => Promise<SignupResult>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  setUserAndToken: (newUser: User, newToken: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user && !!token;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      if (storedToken) {
        setToken(storedToken);
        
        // Fetch user data from server to verify token and get fresh data
        try {
          const response = await authAPI.getProfile();
          setUser(response.data.user);
        } catch {
          // Token invalid, clear stored data
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const signin = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await authAPI.signin({ email, password });
      
      const { token: newToken, data } = response;
      setToken(newToken);
      setUser(data.user);
      
      // Store only token in localStorage (user data is in memory)
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
      
      setIsLoading(false);
      
    } catch (error: unknown) {
      setIsLoading(false);
      // Pass the full error object to the component so it can handle different error types
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, confirmPassword: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await authAPI.signup({ name, email, password, confirmPassword });
      
      // Check if email verification is needed
      if (response.data && response.data.needsVerification) {
        // Don't set auth state yet, user needs to verify email first
        return { 
          needsVerification: true, 
          email: response.data.email,
          isResend: response.data.isResend 
        };
      }
      
      // If no verification needed (email service not available), proceed normally
      const { token: newToken, data } = response;
      setToken(newToken);
      setUser(data.user);
      
      // Store only token in localStorage (user data is in memory)
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
      
      return { needsVerification: false };
      
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to sign up';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call success
      setUser(null);
      setToken(null);
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Expose a method to set user and token from outside (e.g., OAuthSuccessPage)
  const setUserAndToken = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
  };

  const value: AuthContextType & { setUserAndToken: typeof setUserAndToken } = {
    user,
    token,
    isLoading,
    isAuthenticated,
    signin,
    signup,
    logout,
    error,
    clearError,
    setUserAndToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
