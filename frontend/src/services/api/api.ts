import axios from 'axios';
import { User, JwtResponse } from '../../types/User';
import { API_CONFIG } from '../../config/api.config';

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header for authenticated requests
api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return config;
});

// Обработка ошибок авторизации
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Если получаем 401 Unauthorized, очищаем localStorage и перенаправляем на страницу логина
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Сервисы аутентификации
export const authService = {
  login: async (username: string, password: string): Promise<User> => {
    try {
      const response = await api.post<JwtResponse>(`${API_CONFIG.API_VERSION}/auth/login`, { username, password });
      
      // Преобразуем ответ с сервера в формат, используемый на клиенте
      const userData: User = {
        id: response.data.id,
        username: response.data.username,
        role: response.data.roles.includes('ROLE_ADMIN') ? 'ADMIN' : 'USER',
        token: response.data.token
      };
      
      return userData;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Ошибка аутентификации');
      }
      throw new Error('Сервер недоступен. Пожалуйста, попробуйте позже.');
    }
  },
  
  signup: async (username: string, password: string): Promise<User> => {
    try {
      await api.post(`${API_CONFIG.API_VERSION}/auth/register`, { username, password });
      return await authService.login(username, password);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Ошибка регистрации');
      }
      throw new Error('Сервер недоступен. Пожалуйста, попробуйте позже.');
    }
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get(`${API_CONFIG.API_VERSION}/users/me`);
      
      // Получаем текущего пользователя из localStorage для получения токена
      const userStr = localStorage.getItem('user');
      let token = '';
      if (userStr) {
        token = JSON.parse(userStr).token;
      }
      
      // Преобразуем ответ с сервера в формат, используемый на клиенте
      const userData: User = {
        id: response.data.id,
        username: response.data.username,
        role: response.data.role.name === 'ADMIN' ? 'ADMIN' : 'USER',
        token: token
      };
      
      return userData;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Ошибка получения данных пользователя');
      }
      throw new Error('Сервер недоступен. Пожалуйста, попробуйте позже.');
    }
  }
};

// User services
export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get(`${API_CONFIG.API_VERSION}/users`);
      return response.data.map((user: any) => ({
        id: user.id,
        username: user.username,
        role: user.role.name === 'ADMIN' ? 'ADMIN' : 'USER'
      }));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Ошибка загрузки списка пользователей');
      }
      throw new Error('Сервер недоступен. Пожалуйста, попробуйте позже.');
    }
  },
  
  getUserById: async (id: string): Promise<User> => {
    try {
      const response = await api.get(`${API_CONFIG.API_VERSION}/users/${id}`);
      return {
        id: response.data.id,
        username: response.data.username,
        role: response.data.role.name === 'ADMIN' ? 'ADMIN' : 'USER'
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Ошибка загрузки данных пользователя');
      }
      throw new Error('Сервер недоступен. Пожалуйста, попробуйте позже.');
    }
  },
  
  createUser: async (username: string, password: string, role: string): Promise<User> => {
    try {
      const response = await api.post(`${API_CONFIG.API_VERSION}/users`, { 
        username, 
        password,
        roleName: role
      });
      
      return {
        id: response.data.id,
        username: response.data.username,
        role: response.data.role.name === 'ADMIN' ? 'ADMIN' : 'USER'
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Ошибка создания пользователя');
      }
      throw new Error('Сервер недоступен. Пожалуйста, попробуйте позже.');
    }
  },
  
  updateUser: async (id: string, username: string, password?: string, role?: string): Promise<User> => {
    try {
      const requestData: any = {};
      if (username) requestData.username = username;
      if (password) requestData.password = password;
      if (role) requestData.roleName = role;

      const response = await api.put(`${API_CONFIG.API_VERSION}/users/${id}`, requestData);
      return {
        id: response.data.id,
        username: response.data.username,
        role: response.data.role.name === 'ADMIN' ? 'ADMIN' : 'USER'
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Ошибка обновления пользователя');
      }
      throw new Error('Сервер недоступен. Пожалуйста, попробуйте позже.');
    }
  },
  
  deleteUser: async (id: string): Promise<void> => {
    try {
      await api.delete(`${API_CONFIG.API_VERSION}/users/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Ошибка удаления пользователя');
      }
      throw new Error('Сервер недоступен. Пожалуйста, попробуйте позже.');
    }
  }
};

export default api;