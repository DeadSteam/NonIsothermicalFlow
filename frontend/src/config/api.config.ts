export const API_CONFIG = {
  // В production используем полный URL с хостом, в development - относительный путь
  BASE_URL: process.env.NODE_ENV === 'production'
    ? `http://${window.location.hostname}`
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