import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginResponse } from '../types';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loginAsDemo: (role: 'Admin' | 'Tech') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('techservice_token');
    const savedUser = localStorage.getItem('techservice_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('techservice_token');
        localStorage.removeItem('techservice_user');
      }
    }
    setIsLoading(false);

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const handleAuthSuccess = (data: LoginResponse) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('techservice_token', data.token);
    localStorage.setItem('techservice_user', JSON.stringify(data.user));
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    handleAuthSuccess(response);
  };

  const loginAsDemo = async (role: 'Admin' | 'Tech') => {
    const email = role === 'Admin' ? 'admin@techservice.com' : 'tecnico@techservice.com';
    const password = role === 'Admin' ? 'Admin123!' : 'Tech123!';
    await login(email, password);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('techservice_token');
    localStorage.removeItem('techservice_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
