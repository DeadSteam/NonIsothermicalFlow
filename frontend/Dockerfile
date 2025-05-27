# Build stage
FROM node:18-alpine AS builder

# Установка зависимостей для сборки
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Копирование файлов package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm ci --only=production

# Копирование исходного кода
COPY . .

# Сборка приложения
RUN npm run build

# Production stage
FROM nginx:alpine

# Установка необходимых утилит
RUN apk add --no-cache wget

# Копирование собранного приложения
COPY --from=builder /app/build /usr/share/nginx/html

# Копирование конфигурации nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Проверка конфигурации nginx
RUN nginx -t

# Проверка здоровья
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --spider http://localhost:80 || exit 1

# Запуск nginx
CMD ["nginx", "-g", "daemon off;"] 