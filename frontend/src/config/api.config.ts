export const API_CONFIG = {
  // В development используем прокси из package.json, в production - полный URL
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'http://88.201.220.74/api/v1'
    : '/api/v1',
  // Версия API уже включена в BASE_URL
  API_VERSION: ''
};

/**
 * Формирует полный URL для API endpoint
 * @param endpoint - путь эндпоинта без /api/v1
 */
export const getApiUrl = (endpoint: string): string => {
  // Убираем лишние слеши в начале endpoint если они есть
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.BASE_URL}${cleanEndpoint}`;
}; 