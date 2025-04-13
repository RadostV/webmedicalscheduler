# API Документация

## Общ Преглед

Този документ описва REST API на Системата за Медицински Прегледи. API-то е изградено с Node.js и Express, използвайки TypeScript за типизация.

## Автентикация

### Вход
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

#### Отговор
```json
{
  "token": "string",
  "user": {
    "id": "number",
    "username": "string",
    "type": "string"
  }
}
```

### Регистрация
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "password": "string",
  "email": "string",
  "type": "string",
  "name": "string"
}
```

#### Отговор
```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "type": "string"
}
```

## Лекари

### Списък с Лекари
```http
GET /api/doctors
Authorization: Bearer <token>
```

#### Параметри
- `specialty`: Специалност
- `location`: Локация
- `page`: Номер на страница
- `limit`: Брой на елементи на страница

#### Отговор
```json
{
  "doctors": [
    {
      "id": "number",
      "name": "string",
      "specialty": "string",
      "location": "string",
      "languages": ["string"],
      "description": "string"
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

### Детайли за Лекар
```http
GET /api/doctors/:id
Authorization: Bearer <token>
```

#### Отговор
```json
{
  "id": "number",
  "name": "string",
  "specialty": "string",
  "education": "string",
  "qualifications": "string",
  "contact_info": {
    "phone": "string",
    "email": "string",
    "address": "string"
  },
  "location": "string",
  "languages": ["string"],
  "profile_photo_url": "string",
  "description": "string"
}
```

### Актуализиране на Профил
```http
PUT /api/doctors/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "specialty": "string",
  "education": "string",
  "qualifications": "string",
  "contact_info": {
    "phone": "string",
    "email": "string",
    "address": "string"
  },
  "location": "string",
  "languages": ["string"],
  "description": "string"
}
```

## Наличност

### Списък с Наличност
```http
GET /api/doctors/:id/availability
Authorization: Bearer <token>
```

#### Параметри
- `start_date`: Начална дата
- `end_date`: Крайна дата

#### Отговор
```json
{
  "availability": [
    {
      "id": "number",
      "date": "string",
      "time_slots": [
        {
          "start_time": "string",
          "end_time": "string",
          "is_available": "boolean"
        }
      ]
    }
  ]
}
```

### Актуализиране на Наличност
```http
PUT /api/doctors/:id/availability
Authorization: Bearer <token>
Content-Type: application/json

{
  "availability": [
    {
      "date": "string",
      "time_slots": [
        {
          "start_time": "string",
          "end_time": "string",
          "is_available": "boolean"
        }
      ]
    }
  ]
}
```

## Прегледи

### Списък с Прегледи
```http
GET /api/appointments
Authorization: Bearer <token>
```

#### Параметри
- `status`: Статус на прегледа
- `start_date`: Начална дата
- `end_date`: Крайна дата
- `page`: Номер на страница
- `limit`: Брой на елементи на страница

#### Отговор
```json
{
  "appointments": [
    {
      "id": "number",
      "doctor": {
        "id": "number",
        "name": "string",
        "specialty": "string"
      },
      "date": "string",
      "time": "string",
      "status": "string",
      "notes": "string"
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

### Създаване на Преглед
```http
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "doctor_id": "number",
  "date": "string",
  "time": "string",
  "notes": "string"
}
```

### Актуализиране на Преглед
```http
PUT /api/appointments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "string",
  "notes": "string"
}
```

## Кодове за Отговор

### Успешни Отговори
- `200 OK`: Успешна заявка
- `201 Created`: Успешно създаване
- `204 No Content`: Успешно изтриване

### Грешки
- `400 Bad Request`: Невалидна заявка
- `401 Unauthorized`: Неоторизиран достъп
- `403 Forbidden`: Забранен достъп
- `404 Not Found`: Ресурсът не е намерен
- `409 Conflict`: Конфликт на данни
- `500 Internal Server Error`: Вътрешна сървърна грешка

## Ограничения

### Rate Limiting
- 100 заявки на минута за автентикирани потребители
- 20 заявки на минута за неавтентикирани потребители

### JWT Токени
- Валидност: 24 часа
- Формат: Bearer token
- Алгоритъм: HS256

### HTTPS
- Всички заявки трябва да използват HTTPS
- SSL/TLS версия: 1.2 или по-нова 