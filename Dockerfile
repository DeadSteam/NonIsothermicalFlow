# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build

# Установка необходимых инструментов
RUN apk add --no-cache bash

WORKDIR /workspace/app

# Копирование файлов Gradle
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./

# Установка прав на выполнение gradlew и загрузка зависимостей
RUN chmod +x gradlew
RUN ./gradlew dependencies

# Копирование исходного кода
COPY src src

# Сборка приложения
RUN ./gradlew build -x test --no-daemon

# Run stage
FROM eclipse-temurin:21-jre-alpine

# Установка curl для healthcheck и Docker CLI
RUN apk add --no-cache curl docker-cli postgresql-client

# Создание директории для резервных копий с правильными правами
RUN mkdir -p /app/db_backups && chmod 777 /app/db_backups

WORKDIR /app

# Копирование JAR из этапа сборки
COPY --from=build /workspace/app/build/libs/*.jar app.jar

# Определение точки входа
ENTRYPOINT ["java", \
            "--enable-preview", \
            "-XX:+UseContainerSupport", \
            "-XX:MaxRAMPercentage=75.0", \
            "-jar", \
            "app.jar"] 