import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/User';
import { AuthContextType } from '../types/Auth';
import { authService } from '../services/api/api';

/**
 * Контекст для управления состоянием аутентификации
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Провайдер контекста аутентификации
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Проверка состояния аутентификации при загрузке приложения
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        await checkAuth();
      } catch (err) {
        console.error('Ошибка инициализации аутентификации:', err);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  /**
   * Проверка текущего состояния аутентификации
   */
  const checkAuth = async (): Promise<boolean> => {
    try {
      const storedUser = localStorage.getItem('user');
      
      if (!storedUser) {
        setUser(null);
        return false;
      }
      
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      localStorage.setItem('user', JSON.stringify(currentUser));
      
      return true;
    } catch (err) {
      localStorage.removeItem('user');
      setUser(null);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при проверке аутентификации');
      return false;
    }
  };

  /**
   * Вход пользователя в систему
   */
  const login = async (username: string, password: string): Promise<User> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(username, password);
      localStorage.setItem('user', JSON.stringify(response));
      setUser(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Произошла ошибка при входе в систему';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Регистрация нового пользователя
   */
  const signup = async (username: string, password: string): Promise<User> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.signup(username, password);
      localStorage.setItem('user', JSON.stringify(response));
      setUser(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Произошла ошибка при регистрации';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Выход пользователя из системы
   */
  const logout = () => {
    try {
      localStorage.removeItem('user');
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Ошибка при выходе из системы:', err);
      setError('Произошла ошибка при выходе из системы');
    }
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Хук для использования контекста аутентификации
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
}; 