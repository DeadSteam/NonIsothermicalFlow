export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://88.201.220.74/api/v1',
  API_VERSION: ''
};
 
export const getApiUrl = (endpoint: string): string => {
  // Для всех эндпоинтов используем единый формат
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}${endpoint}`;
}; 