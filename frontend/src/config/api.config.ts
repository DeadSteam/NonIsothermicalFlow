const APP_HOST = process.env.REACT_APP_HOST || 'localhost';

export const API_CONFIG = {
  BASE_URL: `http://${APP_HOST}`,
  API_VERSION: '/api/v1'
};
 
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}/api${API_CONFIG.API_VERSION}${endpoint}`;
}; 