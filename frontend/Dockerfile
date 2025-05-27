# Build stage
FROM node:18-alpine as build

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Передаем аргумент для API URL
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Собираем приложение
RUN npm run build

# Production stage
FROM node:18-alpine

# Устанавливаем serve
RUN npm install -g serve

# Создаем пользователя для запуска приложения
RUN addgroup -S app && adduser -S app -G app

# Создаем директорию для приложения
WORKDIR /app

# Копируем собранные файлы
COPY --from=build --chown=app:app /app/build ./build

# Переключаемся на непривилегированного пользователя
USER app

# Экспозим порт
EXPOSE 3000

# Запускаем serve
CMD ["serve", "-s", "build", "-l", "3000"] 