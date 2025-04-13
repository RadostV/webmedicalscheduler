# Ръководство за Сигурност

## Общ Преглед

Този документ описва мерките за сигурност, имплементирани в Системата за Медицински Прегледи. Системата използва множество слоеве защита за осигуряване на сигурността на данните и защита на конфиденциалността на пациентите.

## Автентикация и Авторизация

### JWT Токени

```typescript
// src/middleware/auth.middleware.ts
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Липсва токен за достъп' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Невалиден токен' });
  }
};
```

### Пароли

```typescript
// src/utils/password.ts
import bcrypt from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

## API Сигурност

### Rate Limiting

```typescript
// src/middleware/rate-limit.middleware.ts
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минути
  max: 100, // максимум 100 заявки на прозорец
  message: 'Твърде много заявки. Моля, опитайте отново по-късно.'
});
```

### CORS Конфигурация

```typescript
// src/config/cors.ts
import cors from 'cors';

export const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 часа
};
```

## Защита на Данните

### Криптиране на Чувствителни Данни

```typescript
// src/utils/encryption.ts
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
const iv = crypto.randomBytes(16);

export const encrypt = (text: string): string => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

export const decrypt = (encryptedText: string): string => {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
```

### Валидация на Входните Данни

```typescript
// src/middleware/validation.middleware.ts
import { validate } from 'class-validator';

export const validateRequest = (dto: any) => {
  return async (req, res, next) => {
    const dtoObject = new dto();
    Object.assign(dtoObject, req.body);
    
    const errors = await validate(dtoObject);
    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Невалидни данни',
        errors: errors.map(error => ({
          property: error.property,
          constraints: error.constraints
        }))
      });
    }
    
    next();
  };
};
```

## Логване и Мониторинг

### Конфигурация на Логване

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

### Мониторинг на Сигурността

```typescript
// src/middleware/security-monitor.middleware.ts
export const securityMonitor = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });
  
  next();
};
```

## Сигурност на Базата Данни

### Конфигурация на PostgreSQL

```sql
-- Настройки за сигурност
ALTER SYSTEM SET password_encryption = 'scram-sha-256';
ALTER SYSTEM SET ssl = 'on';
ALTER SYSTEM SET ssl_cert_file = '/path/to/server.crt';
ALTER SYSTEM SET ssl_key_file = '/path/to/server.key';

-- Създаване на потребител с ограничени права
CREATE USER app_user WITH PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE medical_scheduler TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
```

### Защита срещу SQL Инжекции

```typescript
// src/config/database.ts
import { Pool } from 'pg';

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  ssl: {
    rejectUnauthorized: true
  }
});

// Използване на параметризирани заявки
export const query = async (text: string, params: any[]) => {
  return pool.query(text, params);
};
```

## Frontend Сигурност

### Защита срещу XSS

```typescript
// src/utils/sanitize.ts
import DOMPurify from 'dompurify';

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};
```

### Защита на Формите

```typescript
// src/components/Form.tsx
import { CSRFProtection } from './CSRFProtection';

export const Form = () => {
  return (
    <form>
      <CSRFProtection />
      {/* останалите полета на формата */}
    </form>
  );
};
```

## Редовни Обновявания

### План за Обновявания

```bash
#!/bin/bash
# update.sh

# Обновяване на системата
sudo apt-get update
sudo apt-get upgrade -y

# Обновяване на npm пакетите
npm audit fix
npm update

# Рестартиране на приложението
pm2 restart all
```

### Мониторинг на Зависимостите

```json
{
  "scripts": {
    "security-check": "npm audit",
    "update-deps": "npm update",
    "check-updates": "ncu"
  }
}
```

## План за Реагиране при Инциденти

### Процес на Реагиране

1. **Откриване**
   - Мониторинг на логовете
   - Сигнали за сигурност
   - Доклади от потребители

2. **Оценка**
   - Определяне на обхвата
   - Оценка на риска
   - Планиране на действията

3. **Реагиране**
   - Изолиране на засегнатите системи
   - Събиране на доказателства
   - Прилагане на корективни мерки

4. **Възстановяване**
   - Възстановяване на системите
   - Проверка на сигурността
   - Докладване на резултатите

### Контакти за Сигурност

```
Инцидентен отговор:
Email: security@example.com
Телефон: +359 2 123 4567

Извънредни ситуации:
Email: emergency@example.com
Телефон: +359 2 987 6543
``` 