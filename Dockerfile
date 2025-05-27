# Build stage
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app
COPY . .
RUN ./gradlew clean build -x test --no-daemon

# Production stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Установка необходимых утилит
RUN apk add --no-cache wget

# Копирование артефактов сборки
COPY --from=builder /app/build/libs/*.jar app.jar

# Проверка наличия файла
RUN test -e app.jar

# Настройка переменных среды
ENV TZ=UTC
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Проверка здоровья
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --spider http://localhost:8080/api/actuator/health || exit 1

# Запуск приложения
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"] 