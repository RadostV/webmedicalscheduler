# Архитектура на Системата

## Общ Преглед

Този документ описва архитектурата на Системата за Медицински Прегледи. Системата е проектирана като модерно уеб приложение с разделена архитектура, състояща се от frontend и backend компоненти.

## Системна Архитектура

### Компоненти
```mermaid
graph TD
    A[Frontend React App] --> B[Backend API]
    B --> C[PostgreSQL Database]
    B --> D[File Storage]
    E[Email Service] --> B
    F[Monitoring] --> B
```

#### Описание
- **Frontend**: React приложение с TypeScript
- **Backend**: Node.js API с Express
- **База Данни**: PostgreSQL
- **Файлово Съхранение**: AWS S3
- **Email Служба**: SendGrid
- **Мониторинг**: Prometheus & Grafana

## Frontend Архитектура

### Структура на Компонентите
```mermaid
graph TD
    A[App] --> B[Router]
    B --> C[Auth Pages]
    B --> D[Patient Pages]
    B --> E[Doctor Pages]
    D --> F[Search Doctors]
    D --> G[Appointments]
    E --> H[Schedule]
    E --> I[Profile]
```

#### Описание
- Модулна структура
- Разделение по роли
- Преизползваеми компоненти
- Централизирано управление на състоянието

### Технологичен Стек
```typescript
// package.json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.x",
    "@mui/material": "^5.x",
    "@emotion/react": "^11.x",
    "@emotion/styled": "^11.x",
    "axios": "^1.x",
    "date-fns": "^2.x"
  }
}
```

## Backend Архитектура

### Структура на API
```mermaid
graph TD
    A[API Gateway] --> B[Auth Service]
    A --> C[Doctor Service]
    A --> D[Appointment Service]
    B --> E[Database]
    C --> E
    D --> E
```

#### Описание
- RESTful API дизайн
- Модулни услуги
- Централизирана автентикация
- Разделена бизнес логика

### Технологичен Стек
```typescript
// package.json
{
  "dependencies": {
    "express": "^4.x",
    "typeorm": "^0.3.x",
    "pg": "^8.x",
    "jsonwebtoken": "^9.x",
    "bcrypt": "^5.x",
    "joi": "^17.x",
    "winston": "^3.x"
  }
}
```

## База Данни

### Схема на Базата Данни
```mermaid
erDiagram
    Users ||--o{ Appointments : "has"
    Users ||--o{ Doctors : "has"
    Doctors ||--o{ Availability : "has"
    Doctors ||--o{ Appointments : "has"
```

#### Описание
- Нормализирана структура
- Оптимизирани индекси
- Релационни връзки
- Типизирани данни

## Сигурност

### Архитектура на Сигурността
```mermaid
graph TD
    A[Client] -->|HTTPS| B[Load Balancer]
    B -->|HTTPS| C[API Gateway]
    C -->|JWT| D[Services]
    D -->|Encrypted| E[Database]
```

#### Описание
- SSL/TLS криптиране
- JWT автентикация
- Rate limiting
- CORS защита

## Масштабируемост

### Хоризонтално Мащабиране
```mermaid
graph TD
    A[Load Balancer] --> B[Instance 1]
    A --> C[Instance 2]
    A --> D[Instance 3]
    B --> E[Database Cluster]
    C --> E
    D --> E
```

#### Описание
- Балансиране на натоварването
- Репликация на базата данни
- Кеширане
- CDN интеграция

## Мониторинг

### Архитектура на Мониторинга
```mermaid
graph TD
    A[Application] -->|Metrics| B[Prometheus]
    A -->|Logs| C[ELK Stack]
    B -->|Visualization| D[Grafana]
    C -->|Visualization| D
```

#### Описание
- Събиране на метрики
- Логване
- Визуализация
- Известяване

## CI/CD

### Процес на Разработка
```mermaid
graph LR
    A[Development] -->|Push| B[GitHub]
    B -->|Trigger| C[GitHub Actions]
    C -->|Test| D[Test Environment]
    C -->|Deploy| E[Production]
```

#### Описание
- Автоматизирано тестване
- Непрекъснато интегриране
- Автоматично разгръщане
- Версиониране

## Резервни Копия

### Стратегия за Резервни Копия
```mermaid
graph TD
    A[Database] -->|Daily| B[Full Backup]
    A -->|Hourly| C[Incremental Backup]
    B -->|Encrypt| D[Cloud Storage]
    C -->|Encrypt| D
```

#### Описание
- Редовни резервни копия
- Криптиране
- Географско разпространение
- Възстановяване

## Отказоустойчивост

### Архитектура на Отказоустойчивостта
```mermaid
graph TD
    A[Primary Region] -->|Replicate| B[Secondary Region]
    A -->|Failover| C[Backup Region]
    B -->|Failover| C
```

#### Описание
- Регионална репликация
- Автоматично превключване
- Възстановяване при отказ
- Географско разпространение

## Бележки за Имплементацията

### Добри Практики
- Модулна архитектура
- Чист код
- SOLID принципи
- DRY принцип
- KISS принцип

### Производителност
- Оптимизация на заявки
- Кеширане
- Лениво зареждане
- Компресия

### Поддръжка
- Документация
- Тестове
- Логване
- Мониторинг 