# Backend Компоненти

## Общ Преглед

Системата за Медицински Прегледи е построена с Node.js, Express и TypeScript, използвайки PostgreSQL като база данни. Backend частта е организирана в модулна структура, която позволява лесно разширяване и поддръжка.

## Основни Компоненти

### Конфигурация

```typescript
// src/config/index.ts
interface Config {
  port: number;
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
}

export const config: Config = {
  port: parseInt(process.env.PORT || '3001'),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'medical_scheduler',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '24h'
  }
};
```

### База Данни

```typescript
// src/config/database.ts
import { Pool } from 'pg';
import { config } from './index';

export const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  max: 20,
  idleTimeoutMillis: 30000
});

pool.on('error', (err) => {
  console.error('Грешка в базата данни:', err);
});
```

### Маршрутизиране

```typescript
// src/routes/index.ts
import express from 'express';
import { authRoutes } from './auth.routes';
import { doctorRoutes } from './doctor.routes';
import { appointmentRoutes } from './appointment.routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);

export default router;
```

### Middleware

```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Липсва токен за достъп' });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Невалиден токен' });
  }
};
```

### Услуги

```typescript
// src/services/doctor.service.ts
import { pool } from '../config/database';
import { Doctor } from '../models/doctor';

export class DoctorService {
  async findById(id: string): Promise<Doctor> {
    const result = await pool.query(
      'SELECT * FROM doctors WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  async update(id: string, data: Partial<Doctor>): Promise<Doctor> {
    const result = await pool.query(
      'UPDATE doctors SET name = $1, specialty = $2 WHERE id = $3 RETURNING *',
      [data.name, data.specialty, id]
    );
    return result.rows[0];
  }
}
```

### Валидация

```typescript
// src/validation/doctor.schema.ts
import Joi from 'joi';

export const doctorSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  specialty: Joi.string().required(),
  location: Joi.string().required(),
  education: Joi.array().items(Joi.string()),
  languages: Joi.array().items(Joi.string())
});

export const validateDoctor = (data: any) => {
  return doctorSchema.validate(data);
};
```

### Логване

```typescript
// src/config/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
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

### Тестване

```typescript
// src/tests/doctor.test.ts
import request from 'supertest';
import { app } from '../app';
import { pool } from '../config/database';

describe('Doctor API', () => {
  beforeAll(async () => {
    await pool.connect();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('трябва да създаде нов доктор', async () => {
    const response = await request(app)
      .post('/api/doctors')
      .send({
        name: 'Д-р Иванов',
        specialty: 'Кардиолог',
        location: 'София'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

## Имплементационни Забележки

### Добри Практики
1. Използвайте чист код и SOLID принципи
2. Имплементирайте proper error handling
3. Използвайте TypeScript за типова безопасност
4. Следвайте RESTful API принципите
5. Документирайте кода с JSDoc

### Оптимизации
1. Използвайте connection pooling
2. Имплементирайте кеширане
3. Оптимизирайте заявките към базата данни
4. Използвайте compression
5. Имплементирайте rate limiting

### Поддръжка
1. Редовни обновявания на зависимостите
2. Мониторинг на производителността
3. Автоматизирани тестове
4. Документация
5. Code reviews 