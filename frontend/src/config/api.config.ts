export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://88.201.220.74:8080',
  API_VERSION: '/api/v1'
};

export const getApiUrl = (endpoint: string): string => {
  // Для всех эндпоинтов используем единый формат
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}${endpoint}`;
}; 