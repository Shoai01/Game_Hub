/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading] = useState(false);

  const login = useCallback(async ({ email, password }) => {
    try {
      const { user: loggedInUser } = await authService.login({ email, password });
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      const message = err?.response?.data?.detail || err?.message || 'Login failed.';
      throw new Error(message);
    }
  }, []);

  const register = useCallback(async ({ username, email, password }) => {
    try {
      const { user: newUser } = await authService.register({ username, email, password });
      setUser(newUser);
      return newUser;
    } catch (err) {
      const message = err?.response?.data?.detail || err?.message || 'Registration failed.';
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(() => {
    const stored = authService.getCurrentUser();
    if (stored) setUser(stored);
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
