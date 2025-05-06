export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || '',
  API_VERSION: '/api/v1'
};
 
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.API_VERSION}${endpoint}`;
}; 