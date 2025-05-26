export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || window.location.origin,
  API_VERSION: '/api/v1'
};
 
export const getApiUrl = (endpoint: string): string => {
  // Для свойств и коэффициентов не используем версию API
  if (endpoint.startsWith('/material-properties') || endpoint.startsWith('/material-coefficients') || endpoint.startsWith('/material-coefficient-values')) {
    return `${API_CONFIG.BASE_URL}/api${endpoint}`;
  }
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}${endpoint}`;
}; 