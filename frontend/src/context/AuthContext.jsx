/**
 * Auth Context Provider
 * Manages global authentication state using React Context.
 * Handles login, signup, logout, and persistent session via localStorage.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('ucab_user');
    const token = localStorage.getItem('ucab_token');

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('ucab_user');
        localStorage.removeItem('ucab_token');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await authAPI.login(credentials);
    const userData = response.data.data;

    localStorage.setItem('ucab_token', userData.token);
    localStorage.setItem('ucab_user', JSON.stringify(userData));
    setUser(userData);

    return userData;
  }, []);

  const signup = useCallback(async (formData) => {
    const response = await authAPI.register(formData);
    const userData = response.data.data;

    localStorage.setItem('ucab_token', userData.token);
    localStorage.setItem('ucab_user', JSON.stringify(userData));
    setUser(userData);

    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ucab_token');
    localStorage.removeItem('ucab_user');
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isDriver: user?.role === 'driver',
    isRider: user?.role === 'rider',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
