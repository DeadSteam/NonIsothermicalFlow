# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Создаем файл .env во время сборки
ARG APP_HOST
ENV REACT_APP_HOST=${APP_HOST}

RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/build ./build
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"] 