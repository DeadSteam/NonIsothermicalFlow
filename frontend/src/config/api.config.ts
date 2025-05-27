export const API_CONFIG = {
  // В production используем внешний IP, в development - относительный путь
  BASE_URL: process.env.NODE_ENV === 'production'
    ? 'http://88.201.220.74'
    : '',
  API_VERSION: '/api/v1'
};

/**
 * Формирует полный URL для API endpoint
 * @param endpoint - путь эндпоинта без /api/v1
 */
export const getApiUrl = (endpoint: string): string => {
  // Убираем лишние слеши в начале endpoint если они есть
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}/${cleanEndpoint}`;
}; 