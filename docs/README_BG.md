# Документация на Системата за Планиране на Медицински Прегледи

## Съдържание
1. [Общ Преглед](#общ-преглед)
2. [Архитектура](#архитектура)
3. [Системни Компоненти](#системни-компоненти)
4. [Схема на Базата Данни](#схема-на-базата-данни)
5. [API Документация](#api-документация)
6. [Frontend Компоненти](#frontend-компоненти)
7. [Автентикация и Авторизация](#автентикация-и-авторизация)
8. [Внедряване](#внедряване)

## Общ Преглед

Системата за планиране на медицински прегледи е уеб приложение, предназначено за улесняване на процеса на записване за медицински прегледи между пациенти и лекари. Системата поддържа отделни интерфейси за пациенти и лекари, с функционалности за управление на прегледи, профили и сигурна комуникация.

### Основни Функционалности
- Планиране на прегледи за пациенти
- Управление на наличността на лекарите
- Управление на профили за пациенти и лекари
- Сигурна автентикация и авторизация
- Управление на рецепти
- Актуализации в реално време на статуса на прегледите

## Архитектура

### Диаграма на Системната Архитектура
```mermaid
graph TB
    subgraph Frontend
        UI[Потребителски Интерфейс]
        Auth[Автентикация]
        State[Управление на Състоянието]
    end
    
    subgraph Backend
        API[API Сървър]
        AuthM[Auth Middleware]
        DB[(База Данни)]
        FileS[Файлово Хранилище]
    end
    
    UI --> Auth
    Auth --> State
    State --> API
    API --> AuthM
    AuthM --> DB
    API --> FileS
```

### Взаимодействие на Компонентите
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    
    User->>Frontend: Достъп до Приложението
    Frontend->>Backend: Автентикация
    Backend->>Database: Валидация на Данните
    Database-->>Backend: Връщане на Данни
    Backend-->>Frontend: JWT Токен
    Frontend-->>User: Показване на Интерфейс
    
    User->>Frontend: Планиране на Преглед
    Frontend->>Backend: Заявка за Свободни Часове
    Backend->>Database: Заявка за Наличност
    Database-->>Backend: Връщане на Часове
    Backend-->>Frontend: Налични Времеви Слотове
    Frontend-->>User: Показване на Опции
```

## Системни Компоненти

### Frontend Архитектура
```mermaid
graph LR
    subgraph Frontend
        App[App.tsx]
        Router[Router]
        Theme[Theme Provider]
        Auth[Auth Context]
        
        subgraph Pages
            Patient[Страници за Пациенти]
            Doctor[Страници за Лекари]
            Auth[Страници за Автентикация]
        end
        
        subgraph Components
            Common[Общи Компоненти]
            PatientC[Компоненти за Пациенти]
            DoctorC[Компоненти за Лекари]
        end
    end
    
    App --> Router
    Router --> Theme
    Theme --> Auth
    Auth --> Pages
    Pages --> Components
```

### Backend Архитектура
```mermaid
graph LR
    subgraph Backend
        Server[Express Сървър]
        Routes[API Маршрути]
        Middleware[Middleware]
        Services[Услуги]
        DB[(Prisma DB)]
        
        subgraph Routes
            Auth[Auth Маршрути]
            Doctor[Маршрути за Лекари]
            Patient[Маршрути за Пациенти]
        end
        
        subgraph Middleware
            AuthM[Auth Middleware]
            Validation[Валидация]
            Error[Обработка на Грешки]
        end
    end
    
    Server --> Routes
    Routes --> Middleware
    Middleware --> Services
    Services --> DB
```

## Схема на Базата Данни

### Диаграма на Връзките между Обектите
```mermaid
erDiagram
    User ||--o{ Doctor : has
    User ||--o{ Patient : has
    Doctor ||--o{ Availability : has
    Doctor ||--o{ Appointment : has
    Patient ||--o{ Appointment : has
    Appointment ||--|| Prescription : has

    User {
        int id PK
        string username
        string password
        string type
    }

    Doctor {
        int id PK
        int userId FK
        string specialty
        string education
        string qualification
        string description
        string location
        string languages
        binary photo
    }

    Patient {
        int id PK
        int userId FK
    }

    Availability {
        int id PK
        int doctorId FK
        int dayOfWeek
        string startTime
        string endTime
    }

    Appointment {
        int id PK
        int doctorId FK
        int patientId FK
        datetime dateTime
        string status
        string consultationAnalysis
        string description
    }

    Prescription {
        int id PK
        int appointmentId FK
        binary file
        string fileType
    }
```

## API Документация

### Endpoints за Автентикация

#### Вход
- **Endpoint**: `POST /api/auth/login`
- **Описание**: Автентикация на потребител и връщане на JWT токен
- **Тяло на Заявката**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Отговор**:
  ```json
  {
    "token": "string",
    "user": {
      "id": "number",
      "type": "string"
    }
  }
  ```

### Endpoints за Лекари

#### Получаване на Профил
- **Endpoint**: `GET /api/doctors/profile`
- **Описание**: Получаване на профила на автентикирания лекар
- **Заглавни Редове**: `Authorization: Bearer <token>`
- **Отговор**:
  ```json
  {
    "id": "string",
    "userId": "string",
    "specialty": "string",
    "education": "string",
    "qualification": "string",
    "description": "string",
    "location": "string",
    "languages": "string",
    "photoUrl": "string"
  }
  ```

#### Актуализиране на Профил
- **Endpoint**: `PATCH /api/doctors/profile`
- **Описание**: Актуализиране на информацията в профила на лекара
- **Заглавни Редове**: `Authorization: Bearer <token>`
- **Тяло на Заявката**:
  ```json
  {
    "specialty": "string",
    "education": "string",
    "qualification": "string",
    "description": "string",
    "location": "string",
    "languages": "string"
  }
  ```

### Endpoints за Прегледи

#### Получаване на Свободни Часове
- **Endpoint**: `GET /api/doctors/:id/slots`
- **Описание**: Получаване на свободни часове за преглед при конкретен лекар
- **Параметри на Заявката**:
  - `date`: Формат YYYY-MM-DD
- **Отговор**:
  ```json
  ["HH:mm", "HH:mm", ...]
  ```

#### Завършване на Преглед
- **Endpoint**: `PATCH /api/doctors/appointments/:id/complete`
- **Описание**: Завършване на преглед с медицински детайли
- **Заглавни Редове**: `Authorization: Bearer <token>`
- **Тяло на Заявката**:
  ```json
  {
    "consultationAnalysis": "string",
    "description": "string",
    "prescriptionFile": "file"
  }
  ```

## Frontend Компоненти

### Йерархия на Компонентите
```mermaid
graph TD
    App --> Router
    Router --> AuthGuard
    AuthGuard --> PatientRoutes
    AuthGuard --> DoctorRoutes
    
    PatientRoutes --> SearchDoctors
    PatientRoutes --> DoctorProfileViewer
    PatientRoutes --> Appointments
    
    DoctorRoutes --> DoctorProfile
    DoctorRoutes --> Availability
    DoctorRoutes --> Appointments
    
    subgraph Common Components
        Navbar
        Footer
        Loading
        ErrorBoundary
    end
```

## Автентикация и Авторизация

### Процес на Автентикация
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant JWT
    
    User->>Frontend: Заявка за Вход
    Frontend->>Backend: POST /api/auth/login
    Backend->>Backend: Валидация на Данните
    Backend->>JWT: Генериране на Токен
    JWT-->>Backend: Връщане на Токен
    Backend-->>Frontend: Отговор с Токен
    Frontend->>Frontend: Съхранение на Токен
    Frontend-->>User: Пренасочване към Табло
```

### Процес на Авторизация
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant AuthM
    
    User->>Frontend: Достъп до Защитен Маршрут
    Frontend->>Backend: Заявка с Токен
    Backend->>AuthM: Валидация на Токен
    AuthM->>AuthM: Проверка на Права
    AuthM-->>Backend: Резултат от Авторизация
    Backend-->>Frontend: Отговор
    Frontend-->>User: Показване на Съдържание
```

## Внедряване

### Архитектура на Внедряването
```mermaid
graph TB
    subgraph Production
        LB[Балансиращ Товар]
        subgraph Frontend
            F1[Frontend Сървър 1]
            F2[Frontend Сървър 2]
        end
        subgraph Backend
            B1[Backend Сървър 1]
            B2[Backend Сървър 2]
        end
        DB[(База Данни)]
        Cache[(Redis Кеш)]
    end
    
    LB --> F1
    LB --> F2
    F1 --> B1
    F1 --> B2
    F2 --> B1
    F2 --> B2
    B1 --> DB
    B2 --> DB
    B1 --> Cache
    B2 --> Cache
```

### Настройка на Средата
1. Променливи на Средата за Frontend:
   ```
   REACT_APP_API_URL=http://localhost:3001
   REACT_APP_ENV=development
   ```

2. Променливи на Средата за Backend:
   ```
   PORT=3001
   DATABASE_URL=postgresql://user:password@localhost:5432/medical_scheduler
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

### Стъпки за Внедряване
1. Създаване на Frontend:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. Внедряване на Backend:
   ```bash
   cd backend
   npm install
   npm run build
   npm start
   ```

3. Миграция на Базата Данни:
   ```bash
   cd backend
   npx prisma migrate deploy
   ``` 