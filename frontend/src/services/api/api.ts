import axios from 'axios';
import { User } from '../../context/AuthContext';

// API URL for backend connection
const API_URL = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header for authenticated requests
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('user');
  if (user) {
    config.headers.Authorization = `Bearer ${JSON.parse(user).token}`;
  }
  return config;
});

// Эмуляция ответа API для аутентификации
const mockUserResponse = (username: string): User => {
  // Определение роли в зависимости от имени пользователя
  const role = username.toLowerCase().includes('admin') ? 'Администратор' : 'Исследователь';
  
  return {
    id: Math.floor(Math.random() * 1000),
    username,
    role,
    token: `mock-token-${Date.now()}`
  };
};

// Эмуляция API сервисов
export const authService = {
  login: async (username: string, password: string): Promise<User> => {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Проверка логина и пароля (простая эмуляция)
    if (!username || !password) {
      throw new Error('Имя пользователя и пароль обязательны');
    }
    
    if (password.length < 4) {
      throw new Error('Пароль должен содержать не менее 4 символов');
    }
    
    // Возвращаем мок-ответ
    return mockUserResponse(username);
  },
  
  signup: async (username: string, password: string): Promise<User> => {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Проверка данных
    if (!username || !password) {
      throw new Error('Имя пользователя и пароль обязательны');
    }
    
    if (username.length < 3) {
      throw new Error('Имя пользователя должно содержать не менее 3 символов');
    }
    
    if (password.length < 6) {
      throw new Error('Пароль должен содержать не менее 6 символов');
    }
    
    // Возвращаем мок-ответ
    return mockUserResponse(username);
  }
};

// User services
export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Ошибка загрузки списка пользователей');
      }
      throw new Error('Сервер недоступен. Пожалуйста, попробуйте позже.');
    }
  },
  
  getUserById: async (id: number): Promise<User> => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Ошибка загрузки данных пользователя');
      }
      throw new Error('Сервер недоступен. Пожалуйста, попробуйте позже.');
    }
  },
  
  createUser: async (user: Omit<User, 'id'>): Promise<User> => {
    try {
      const response = await api.post('/users', user);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Ошибка создания пользователя');
      }
      throw new Error('Сервер недоступен. Пожалуйста, попробуйте позже.');
    }
  },
  
  updateUser: async (id: number, user: Partial<User>): Promise<User> => {
    try {
      const response = await api.put(`/users/${id}`, user);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Ошибка обновления пользователя');
      }
      throw new Error('Сервер недоступен. Пожалуйста, попробуйте позже.');
    }
  },
  
  deleteUser: async (id: number): Promise<void> => {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Ошибка удаления пользователя');
      }
      throw new Error('Сервер недоступен. Пожалуйста, попробуйте позже.');
    }
  }
};

export default api;