import axios from 'axios';
import { User } from '../context/AuthContext';

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

// Authentication services
export const authService = {
  login: async (username: string, password: string): Promise<User> => {
    try {
      const response = await api.post('/auth/login', { username, password });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Ошибка аутентификации');
      }
      throw new Error('Сервер недоступен. Пожалуйста, попробуйте позже.');
    }
  },

  signup: async (username: string, password: string): Promise<User> => {
    try {
      const response = await api.post('/auth/signup', { username, password });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Ошибка регистрации');
      }
      throw new Error('Сервер недоступен. Пожалуйста, попробуйте позже.');
    }
  },
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