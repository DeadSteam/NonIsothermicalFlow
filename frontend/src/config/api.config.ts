export const API_CONFIG = {
  // Используем переменную окружения для базового URL
  BASE_URL: process.env.REACT_APP_API_URL || '/api/v1',
  API_VERSION: ''
};

/**
 * Формирует полный URL для API endpoint
 * @param endpoint - путь эндпоинта без /api/v1
 */
export const getApiUrl = (endpoint: string): string => {
  // Убираем лишние слеши в начале endpoint если они есть
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.BASE_URL}/${cleanEndpoint}`;
}; 