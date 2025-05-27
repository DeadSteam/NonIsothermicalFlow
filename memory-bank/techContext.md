# Технический контекст

## Технологический стек

### Frontend
- **Основной фреймворк**: React с TypeScript
- **Сборка**: Create React App
- **Стили**: CSS Modules
- **Раздача статики**: serve
- **Порт**: 3000

### Backend
- **Фреймворк**: Spring Boot
- **Язык**: Java 23
- **API**: REST
- **Аутентификация**: JWT
- **Порт**: 8080

### Базы данных
- **СУБД**: PostgreSQL 16
- **Базы**:
  - Materials DB (порт 5432)
  - Users DB (порт 5433)
- **Volumes**: Постоянное хранение данных

### Контейнеризация
- **Платформа**: Docker
- **Оркестрация**: Docker Compose
- **Сети**:
  - app-network (внутренняя)
  - web (внешняя)

### Планируемый прокси-сервер (Nginx)
- **Версия**: Latest stable
- **SSL/TLS**: Let's Encrypt
- **Порты**: 80 (HTTP) и 443 (HTTPS)
- **Функции**:
  - Reverse proxy
  - Load balancing
  - SSL termination
  - Static content caching
  - Security headers
  - Rate limiting

## Конфигурация

### Docker Compose
```yaml
version: '3.8'
services:
  # Базы данных
  postgres-materials:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    volumes: [postgres-materials-data:/var/lib/postgresql/data]

  postgres-users:
    image: postgres:16-alpine
    ports: ["5433:5433"]
    volumes: [postgres-users-data:/var/lib/postgresql/data]

  # Бэкенд
  backend:
    build: .
    expose: ["8080"]
    depends_on: [postgres-materials, postgres-users]

  # Фронтенд
  frontend:
    build: ./frontend
    ports: ["80:3000"]
    depends_on: [backend]
```

## Зависимости

### Frontend
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0"
  }
}
```

### Backend
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
</dependencies>
```

## Безопасность

### Текущие меры
- JWT аутентификация
- CORS защита
- Валидация входных данных
- Изоляция контейнеров

### Планируемые улучшения
- SSL/TLS шифрование
- HTTP/2
- Security headers
- Rate limiting
- DDoS protection
- WAF (Web Application Firewall)

## Мониторинг

### Текущий
- Docker healthcheck
- Логи контейнеров
- Spring Boot Actuator

### Планируемый
- Nginx access/error logs
- Prometheus metrics
- Grafana dashboards
- ELK stack
- Alerting system 