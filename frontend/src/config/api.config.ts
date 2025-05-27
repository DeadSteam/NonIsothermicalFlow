export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  API_VERSION: '/api/v1'
};
 
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}${endpoint}`;
}; 