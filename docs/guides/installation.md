# Ръководство за Инсталиране

Това ръководство ще ви преведе през стъпките за настройка и стартиране на Системата за Медицински Прегледи локално.

## Предварителни Изисквания

Преди да започнете, уверете се, че имате инсталирано следното:

- [Node.js](https://nodejs.org/) (v14 или по-нова версия)
- [npm](https://www.npmjs.com/) (v6 или по-нова версия)
- [PostgreSQL](https://www.postgresql.org/) (v12 или по-нова версия)
- [Git](https://git-scm.com/) (за клониране на репозиторито)

## Клониране на Репозиторито

```bash
git clone https://github.com/yourusername/medical-appointment-system.git
cd medical-appointment-system
```

## Настройка на Базата Данни

1. Създайте PostgreSQL база данни за приложението:

```bash
psql -U postgres
CREATE DATABASE medical_appointment;
\q
```

2. Актуализирайте настройките за връзка с базата данни в backend:

Създайте файл `.env` в директорията `backend` със следното съдържание (коригирайте стойностите според нуждите):

```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/medical_appointment"
JWT_SECRET="your-jwt-secret-key"
PORT=3001
```

## Настройка на Backend

1. Навигирайте до директорията на backend и инсталирайте зависимостите:

```bash
cd backend
npm install
```

2. Изпълнете миграции на базата данни за настройка на схемата:

```bash
npx prisma migrate dev
```

3. (По избор) Попълнете базата данни с примерни данни:

```bash
npm run seed
```

4. Стартирайте backend сървъра:

```bash
npm run dev
```

Backend API трябва да работи на `http://localhost:3001`.

## Настройка на Frontend

1. Отворете нов терминал, навигирайте до директорията на frontend и инсталирайте зависимостите:

```bash
cd frontend
npm install
```

2. Създайте файл `.env.local` в директорията на frontend с URL на API:

```
REACT_APP_API_URL=http://localhost:3001/api
```

3. Стартирайте frontend development сървъра:

```bash
npm start
```

Frontend приложението трябва да работи на `http://localhost:3000`.

## Достъп до Приложението

След като и backend, и frontend работят, можете да достъпите приложението във вашия уеб браузър:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:3001/api](http://localhost:3001/api)
- API Документация: [http://localhost:3001/api-docs](http://localhost:3001/api-docs) (Swagger UI)

## Демо Акаунти

Ако изпълнихте seed скрипта, трябва да имате достъп до следните демо акаунти:

### Акаунт за Лекар

- Потребителско име: doctor1
- Парола: password

### Акаунт за Пациент

- Потребителско име: patient1
- Парола: password

## Отстраняване на Проблеми

### Проблеми с Връзката към Базата Данни

Ако срещнете проблеми с връзката към базата данни, проверете:

- PostgreSQL работи
- Данните за достъп в `.env` са правилни
- Базата данни съществува

Опитайте да изпълните `npx prisma db push`, за да се уверите, че схемата е правилно приложена.

### Проблеми с Връзката към API

Ако frontend не може да се свърже с backend:

- Проверете дали и двата сървъра работят
- Проверете настройките за CORS в backend
- Уверете се, че API URL в frontend средата е правилен

### Конфликти на Порти

Ако порт 3000 или 3001 вече се използва, можете да промените портовете:

- За backend: Актуализирайте стойността на `PORT` в `.env` файла
- За frontend: Създайте `.env.local` файл с `PORT=3002` (или друг наличен порт)

## Docker Настройка (По Избор)

Ако предпочитате да използвате Docker:

1. Уверете се, че Docker и Docker Compose са инсталирани
2. Създайте `docker-compose.yml` файл в основната директория:

```yaml
version: "3"

services:
  database:
    image: postgres:13
    environment:
      POSTGRES_DB: medical_appointment
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://postgres:password@database:5432/medical_appointment
      JWT_SECRET: your-jwt-secret-key
      PORT: 3001
    ports:
      - "3001:3001"
    depends_on:
      - database

  frontend:
    build: ./frontend
    environment:
      REACT_APP_API_URL: http://localhost:3001/api
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

3. Стартирайте приложението с Docker Compose:

```bash
docker-compose up
```

Това ще стартира базата данни, backend и frontend услугите заедно. 