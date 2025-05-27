FROM nginx:latest

# Копируем конфигурацию
COPY nginx.conf /etc/nginx/nginx.conf

# Создаем директории для логов
RUN mkdir -p /var/log/nginx

# Экспозим порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"] 