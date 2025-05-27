import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/User';
import { AuthContextType } from '../types/Auth';
import { authService } from '../services/api/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Проверяем авторизацию при загрузке приложения
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setLoading(false);
    };
    
    initAuth();
  }, []);

  // Проверка авторизации пользователя
  const checkAuth = async (): Promise<boolean> => {
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
      setUser(null);
      return false;
    }
    
    try {
      // Пытаемся получить текущего пользователя с сервера
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      
      // Обновляем данные в localStorage
      localStorage.setItem('user', JSON.stringify(currentUser));
      
      return true;
    } catch (err) {
      // Если возникла ошибка, очищаем localStorage и устанавливаем user в null
      localStorage.removeItem('user');
      setUser(null);
      return false;
    }
  };

  // Функция входа
  const login = async (username: string, password: string): Promise<User> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(username, password);
      
      // Сохраняем информацию о пользователе в localStorage
      localStorage.setItem('user', JSON.stringify(response));
      setUser(response);
      return response;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Ошибка аутентификации');
      } else {
        setError('Произошла неизвестная ошибка');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Функция регистрации
  const signup = async (username: string, password: string): Promise<User> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.signup(username, password);
      
      // Сохраняем информацию о пользователе в localStorage
      localStorage.setItem('user', JSON.stringify(response));
      setUser(response);
      return response;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Ошибка регистрации');
      } else {
        setError('Произошла неизвестная ошибка');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Функция выхода
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
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

// Хук для использования контекста аутентификации
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
}; 