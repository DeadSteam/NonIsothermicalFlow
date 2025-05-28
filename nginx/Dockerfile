FROM nginx:alpine

# Копируем шаблон конфигурации
COPY nginx.conf /etc/nginx/nginx.template
COPY entrypoint.sh /

# Делаем скрипт исполняемым
RUN chmod +x /entrypoint.sh

# Запускаем entrypoint скрипт
CMD ["/entrypoint.sh"]

EXPOSE 80 