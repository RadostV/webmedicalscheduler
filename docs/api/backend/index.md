# Backend API Документация

## Общ Преглед

Този документ описва REST API endpoints, използвани в backend частта на Системата за Медицински Прегледи. API-то е базирано на HTTP/HTTPS протокола и използва JSON формат за обмен на данни.

## Автентикация

### Вход в Системата

```http
POST /api/auth/login
```

#### Описание
Автентикира потребител и връща JWT токен за достъп.

#### Заглавни Редове
```
Content-Type: application/json
```

#### Тяло на Заявката
```json
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
    "type": "string"
  }
}
```

### Регистрация

```http
POST /api/auth/register
```

#### Описание
Регистрира нов потребител в системата.

#### Заглавни Редове
```
Content-Type: application/json
```

#### Тяло на Заявката
```json
{
  "username": "string",
  "password": "string",
  "type": "string",
  "specialty": "string" // Само за лекари
}
```

#### Отговор
```json
{
  "id": "number",
  "username": "string",
  "type": "string"
}
```

## Лекарски Endpoints

### Получаване на Профил

```http
GET /api/doctors/profile
```

#### Описание
Получава профила на автентикирания лекар.

#### Заглавни Редове
```
Authorization: Bearer <token>
```

#### Отговор
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

### Актуализиране на Профил

```http
PUT /api/doctors/profile
```

#### Описание
Актуализира профила на автентикирания лекар.

#### Заглавни Редове
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Тяло на Заявката
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

#### Отговор
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

### Управление на Наличност

#### Добавяне на Наличност

```http
POST /api/doctors/availability
```

#### Описание
Добавя нов период на наличност за автентикирания лекар.

#### Заглавни Редове
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Тяло на Заявката
```json
{
  "dayOfWeek": "number",
  "startTime": "string",
  "endTime": "string"
}
```

#### Отговор
```json
{
  "id": "number",
  "doctorId": "number",
  "dayOfWeek": "number",
  "startTime": "string",
  "endTime": "string"
}
```

#### Премахване на Наличност

```http
DELETE /api/doctors/availability/:id
```

#### Описание
Премахва период на наличност от автентикирания лекар.

#### Заглавни Редове
```
Authorization: Bearer <token>
```

#### Отговор
```json
{
  "success": true
}
```

## Пациентски Endpoints

### Търсене на Лекари

```http
GET /api/doctors
```

#### Описание
Получава списък с всички лекари, филтрирани по специалност и местоположение.

#### Параметри на Заявката
```
specialty: string (по избор)
location: string (по избор)
```

#### Отговор
```json
{
  "doctors": [
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
  ]
}
```

### Запазване на Преглед

```http
POST /api/appointments
```

#### Описание
Създава нов преглед за автентикирания пациент.

#### Заглавни Редове
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Тяло на Заявката
```json
{
  "doctorId": "number",
  "dateTime": "string"
}
```

#### Отговор
```json
{
  "id": "number",
  "doctorId": "number",
  "patientId": "number",
  "dateTime": "string",
  "status": "string"
}
```

### Преглед на Прегледите

```http
GET /api/appointments
```

#### Описание
Получава списък с всички прегледи на автентикирания потребител.

#### Заглавни Редове
```
Authorization: Bearer <token>
```

#### Отговор
```json
{
  "appointments": [
    {
      "id": "number",
      "doctorId": "number",
      "patientId": "number",
      "dateTime": "string",
      "status": "string",
      "consultationAnalysis": "string",
      "description": "string"
    }
  ]
}
```

## Кодове на Отговори

- `200 OK`: Успешна заявка
- `201 Created`: Успешно създаден ресурс
- `400 Bad Request`: Невалидни данни в заявката
- `401 Unauthorized`: Неавтентикиран достъп
- `403 Forbidden`: Нямате права за достъп
- `404 Not Found`: Ресурсът не е намерен
- `500 Internal Server Error`: Вътрешна сървърна грешка

## Ограничения на API

- Всички заявки трябва да използват HTTPS
- JWT токените имат срок на валидност от 24 часа
- Максимален размер на заявката: 1MB
- Rate limiting: 100 заявки на минута на IP адрес 