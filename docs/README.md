# Система за Планиране на Медицински Прегледи - Документация

## Съдържание
1. [Общ Преглед](#общ-преглед)
2. [Основни Функционалности](#основни-функционалности)
3. [Технически Стек](#технически-стек)
4. [Архитектура](#архитектура)
5. [API Документация](#api-документация)
6. [Ръководство за Инсталиране](#ръководство-за-инсталиране)
7. [Ръководство за Разработчици](#ръководство-за-разработчици)
8. [Ръководство за Потребители](#ръководство-за-потребители)

## Общ Преглед

Системата за планиране на медицински прегледи е уеб приложение, предназначено за улесняване на процеса на записване за медицински прегледи между пациенти и лекари. Системата поддържа отделни интерфейси за пациенти и лекари, с функционалности за управление на прегледи, профили и сигурна комуникация.

### Архитектурна Схема
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

## Основни Функционалности

### Автентикация на Потребители
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

### Планиране на Прегледи
```mermaid
sequenceDiagram
    participant Patient
    participant Frontend
    participant Backend
    participant Doctor
    
    Patient->>Frontend: Избор на Лекар
    Frontend->>Backend: Заявка за Свободни Часове
    Backend->>Doctor: Проверка на Графика
    Doctor-->>Backend: Свободни Часове
    Backend-->>Frontend: Налични Слотове
    Frontend-->>Patient: Показване на Опции
    Patient->>Frontend: Избор на Час
    Frontend->>Backend: Запазване на Преглед
    Backend-->>Frontend: Потвърждение
    Frontend-->>Patient: Потвърждение за Запазване
```

## Технически Стек

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

### База Данни
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

### Автентикация

#### Вход в Системата
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

### Лекарски Endpoints

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

## Ръководство за Инсталиране

### Изисквания за Системата
- Node.js (версия 14 или по-нова)
- PostgreSQL (версия 12 или по-нова)
- npm или yarn

### Стъпки за Инсталиране

1. Клониране на Репозиторито:
   ```bash
   git clone [repository-url]
   cd medical-scheduler
   ```

2. Инсталиране на Зависимости:
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install
   ```

3. Конфигуриране на Среда:
   ```bash
   # Frontend (.env)
   REACT_APP_API_URL=http://localhost:3001
   REACT_APP_ENV=development

   # Backend (.env)
   PORT=3001
   DATABASE_URL=postgresql://user:password@localhost:5432/medical_scheduler
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

4. Стартиране на Приложението:
   ```bash
   # Frontend
   cd frontend
   npm start

   # Backend
   cd backend
   npm run dev
   ```

## Ръководство за Разработчици

### Структура на Проекта
```
medical-scheduler/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── middleware/
│   └── package.json
└── docs/
    └── README_BG.md
```

### Конвенции за Код
- Използване на TypeScript за типова безопасност
- Следване на ESLint правила
- Форматиране с Prettier
- Коментиране на сложна логика

## Ръководство за Потребители

### За Пациенти
1. Регистрация и Вход
2. Търсене на Лекари
3. Запазване на Преглед
4. Проследяване на Прегледи
5. Изтегляне на Рецепти

### За Лекари
1. Регистрация и Вход
2. Управление на Профил
3. Управление на График
4. Управление на Прегледи
5. Издаване на Рецепти 