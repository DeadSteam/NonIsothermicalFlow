export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || window.location.origin,
  API_VERSION: '/api/v1'
};

export const getApiUrl = (endpoint: string): string => {
  // Для эндпоинтов аутентификации и администрирования
  if (endpoint.startsWith('/auth') || endpoint.startsWith('/admin') || endpoint.startsWith('/users')) {
    return `${API_CONFIG.BASE_URL}/api${endpoint}`;
  }
  
  // Для свойств и коэффициентов материалов
  if (endpoint.startsWith('/material-properties') || 
      endpoint.startsWith('/material-coefficients') || 
      endpoint.startsWith('/material-coefficient-values')) {
    return `${API_CONFIG.BASE_URL}/api${endpoint}`;
  }

  // Для всех остальных эндпоинтов используем версионирование
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}${endpoint}`;
}; 