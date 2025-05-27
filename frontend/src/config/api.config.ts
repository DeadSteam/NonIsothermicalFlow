export const API_CONFIG = {
  BASE_URL: 'http://localhost',
  API_VERSION: '/api/v1'
};
 
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}/api${API_CONFIG.API_VERSION}${endpoint}`;
}; 