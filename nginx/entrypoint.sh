#!/bin/sh

# Подставляем переменные окружения в конфигурацию nginx
envsubst "\$APP_HOST" < /etc/nginx/nginx.template > /etc/nginx/nginx.conf

# Запускаем nginx
nginx -g 'daemon off;' 