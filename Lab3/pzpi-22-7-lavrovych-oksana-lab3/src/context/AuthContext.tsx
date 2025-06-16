import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User, LoginCredentials } from '../types'; 
import * as authService from '../api/authService';

// 1. Описуємо тип даних, які буде надавати наш контекст
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (newUserData: User) => void; 
}

// 2. Створюємо контекст
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Створюємо провайдер
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = authService.getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error("Failed to initialize auth state:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const loggedInUser = await authService.login(credentials);
      setUser(loggedInUser);
    } catch (error) {
      console.error("AuthContext: Login failed", error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (newUserData: User) => {
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
  };

  // 4. Формуємо значення, яке буде доступне всім дочірнім компонентам
  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    updateUser, 
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};