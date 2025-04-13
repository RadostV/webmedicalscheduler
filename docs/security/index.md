# Ръководство за Сигурност

## Общ Преглед

Този документ описва мерките за сигурност, имплементирани в Системата за Медицински Прегледи. Системата следва най-добрите практики за сигурност в уеб разработката и защита на данните.

## Автентикация и Авторизация

### JWT Токени
```typescript
interface JwtPayload {
  userId: number;
  type: string;
  iat: number;
  exp: number;
}
```

#### Описание
- Токените имат срок на валидност от 24 часа
- Използва се асиметрично криптиране
- Токените съдържат минимална информация

### Пароли
```typescript
// Хеширане на пароли
const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Проверка на пароли
const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

#### Изисквания
- Минимум 8 символа
- Поне една главна буква
- Поне една малка буква
- Поне една цифра
- Поне един специален символ

## Защита на API

### Rate Limiting
```typescript
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минути
  max: 100 // максимум 100 заявки на IP
});
```

#### Описание
- Ограничаване на броя заявки
- Защита срещу brute force атаки
- IP базирано ограничаване

### CORS Конфигурация
```typescript
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
```

#### Описание
- Контролиран достъп от определени домейни
- Ограничени HTTP методи
- Поддръжка на credentials

## Защита на Данните

### Криптиране на Чувствителни Данни
```typescript
interface SensitiveData {
  id: number;
  encryptedData: string;
  iv: string;
}

const encryptData = (data: string): SensitiveData => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  return {
    id: Date.now(),
    encryptedData: encrypted.toString('base64'),
    iv: iv.toString('base64')
  };
};
```

#### Описание
- AES-256-GCM криптиране
- Уникален IV за всяко криптиране
- Безопасно съхранение на ключове

### Валидация на Входните Данни
```typescript
const validateInput = (data: unknown): ValidationResult => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required()
  });
  
  return schema.validate(data);
};
```

#### Описание
- Строга валидация на всички входни данни
- Защита срещу SQL инжекции
- Защита срещу XSS атаки

## Логване и Мониторинг

### Сигурностно Логване
```typescript
interface SecurityLog {
  timestamp: Date;
  event: string;
  userId?: number;
  ip: string;
  details: Record<string, unknown>;
}

const logSecurityEvent = async (log: SecurityLog): Promise<void> => {
  await securityLogger.info({
    ...log,
    timestamp: new Date().toISOString()
  });
};
```

#### Описание
- Логване на всички сигурностни събития
- Съхранение на IP адреси
- Проследяване на опити за достъп

### Мониторинг на Системата
```typescript
const monitorSystem = async (): Promise<void> => {
  const metrics = {
    failedLogins: await getFailedLoginCount(),
    suspiciousIPs: await getSuspiciousIPs(),
    systemLoad: await getSystemLoad()
  };
  
  await alertIfThresholdExceeded(metrics);
};
```

#### Описание
- Мониторинг на опити за неоторизиран достъп
- Откриване на подозрителен трафик
- Известяване при потенциални заплахи

## Безопасност на Базата Данни

### Конфигурация на PostgreSQL
```sql
-- Ограничаване на достъпа до базата данни
ALTER DATABASE medical_scheduler SET "app.jwt_secret" TO 'your-secret';
ALTER DATABASE medical_scheduler SET "app.encryption_key" TO 'your-key';

-- Създаване на специални роли
CREATE ROLE app_user WITH LOGIN PASSWORD 'your-password';
GRANT CONNECT ON DATABASE medical_scheduler TO app_user;
```

#### Описание
- Ограничен достъп до базата данни
- Специални роли за приложението
- Криптиране на чувствителни данни

### Резервни Копия
```bash
#!/bin/bash
# Скрипт за сигурно резервно копие
BACKUP_DIR="/secure/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U app_user -h localhost medical_scheduler | gzip > "$BACKUP_DIR/backup_$DATE.sql.gz"
```

#### Описание
- Криптирани резервни копия
- Редовно архивиране
- Сигурно съхранение

## Безопасност на Frontend

### Защита срещу XSS
```typescript
const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};
```

#### Описание
- Санитизация на всички входни данни
- Защита срещу DOM манипулации
- Безопасно рендериране на HTML

### Защита на Форми
```typescript
const FormProtection = () => {
  const [csrfToken, setCsrfToken] = useState('');
  
  useEffect(() => {
    // Генериране на CSRF токен
    const token = generateCsrfToken();
    setCsrfToken(token);
  }, []);
  
  return (
    <form>
      <input type="hidden" name="_csrf" value={csrfToken} />
      {/* останалите полета */}
    </form>
  );
};
```

#### Описание
- CSRF защита
- Валидация на форми
- Защита срещу автоматични заявки

## Редовни Актуализации

### Проверка на Зависимостите
```bash
# Проверка за уязвимости
npm audit

# Актуализиране на пакети
npm update

# Проверка на outdated пакети
npm outdated
```

#### Описание
- Редовна проверка за уязвимости
- Актуализиране на зависимости
- Следене на security bulletins

### Системни Актуализации
```bash
# Актуализиране на системата
sudo apt-get update
sudo apt-get upgrade

# Проверка на лог файлове
sudo tail -f /var/log/auth.log
```

#### Описание
- Редовни системни актуализации
- Мониторинг на системни логове
- Проверка на сигурностни патчове

## План за Реагиране при Инциденти

### Процес на Реагиране
1. **Откриване**
   - Мониторинг на системите
   - Получаване на сигнали
   - Анализ на инцидента

2. **Оценка**
   - Определяне на обхвата
   - Оценка на риска
   - Планиране на действия

3. **Реагиране**
   - Изолиране на проблема
   - Възстановяване на системите
   - Събиране на доказателства

4. **Възстановяване**
   - Връщане на услугите
   - Проверка на сигурността
   - Документиране на инцидента

### Контакти
- Сигурностен екип: security@medical-scheduler.com
- Телефон за спешни случаи: +359 2 123 4567
- Вътрешен тикет систем: #SEC-INC 