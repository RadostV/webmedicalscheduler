# Backend Компоненти

## Общ Преглед

Този документ описва backend компонентите на Системата за Медицински Прегледи. Системата е изградена с Node.js, Express и TypeScript, използвайки PostgreSQL като база данни.

## Основни Компоненти

### Конфигурация
```typescript
// config.ts
interface Config {
  port: number;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
}

const config: Config = {
  port: process.env.PORT || 3001,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'medical_scheduler'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '24h'
  }
};
```

#### Описание
- Конфигурация на средата
- Параметри на базата данни
- JWT настройки
- Порт и хостове

### База Данни
```typescript
// database.ts
import { Pool } from 'pg';

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.username,
  password: config.database.password,
  database: config.database.database
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error executing query', { text, error });
    throw error;
  }
};
```

#### Описание
- Пул от връзки
- Логване на заявки
- Обработка на грешки
- Транзакции

### Маршрутизация
```typescript
// routes/index.ts
import express from 'express';
import authRoutes from './auth.routes';
import doctorRoutes from './doctor.routes';
import appointmentRoutes from './appointment.routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);

export default router;
```

#### Описание
- Модулна структура
- Middleware
- Валидация
- Обработка на грешки

### Middleware
```typescript
// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Не е предоставен токен' });
  }

  jwt.verify(token, config.jwt.secret, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Невалиден токен' });
    }
    req.user = user;
    next();
  });
};
```

#### Описание
- Автентикация
- Авторизация
- Валидация
- Логване

### Услуги
```typescript
// services/doctor.service.ts
interface DoctorService {
  findById(id: number): Promise<Doctor>;
  update(id: number, data: Partial<Doctor>): Promise<Doctor>;
  create(data: CreateDoctorDto): Promise<Doctor>;
  delete(id: number): Promise<void>;
}

class DoctorServiceImpl implements DoctorService {
  async findById(id: number): Promise<Doctor> {
    const result = await query('SELECT * FROM doctors WHERE id = $1', [id]);
    return result.rows[0];
  }

  async update(id: number, data: Partial<Doctor>): Promise<Doctor> {
    const result = await query(
      'UPDATE doctors SET name = $1, specialty = $2 WHERE id = $3 RETURNING *',
      [data.name, data.specialty, id]
    );
    return result.rows[0];
  }
}
```

#### Описание
- Бизнес логика
- Връзка с базата данни
- Валидация
- Транзакции

### Валидация
```typescript
// validation/doctor.validation.ts
import Joi from 'joi';

const doctorSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  specialty: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
  location: Joi.string().required(),
  languages: Joi.array().items(Joi.string()),
  description: Joi.string().max(1000)
});

export const validateDoctor = (data: any) => {
  return doctorSchema.validate(data);
};
```

#### Описание
- Схеми за валидация
- Правила за валидация
- Съобщения за грешки
- Типизация

### Логване
```typescript
// utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

#### Описание
- Нива на логване
- Форматиране
- Файлови транспорт
- Конзолен транспорт

### Тестване
```typescript
// tests/doctor.test.ts
import request from 'supertest';
import app from '../app';

describe('Doctor API', () => {
  it('should create a new doctor', async () => {
    const response = await request(app)
      .post('/api/doctors')
      .send({
        name: 'Д-р Иванов',
        specialty: 'Кардиолог',
        email: 'ivanov@example.com'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

#### Описание
- Unit тестове
- Интеграционни тестове
- Mock данни
- Тестови среда

## Бележки за Имплементацията

### Добри Практики
- Чист код
- SOLID принципи
- DRY принцип
- KISS принцип

### Производителност
- Кеширане
- Оптимизация на заявки
- Пул от връзки
- Асинхронни операции

### Поддръжка
- Документация
- Логване
- Мониторинг
- Резервни копия 