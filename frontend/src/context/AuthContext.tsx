import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/api/api';

// Define types
export interface User {
  id: number;
  username: string;
  role: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(username, password);
      
      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(response));
      setUser(response);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Ошибка аутентификации');
      } else {
        setError('Произошла неизвестная ошибка');
      }
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (username: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.signup(username, password);
      
      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(response));
      setUser(response);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Ошибка регистрации');
      } else {
        setError('Произошла неизвестная ошибка');
      }
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 