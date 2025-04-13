# Ръководство за Тестване

## Общ Преглед

Този документ описва стратегията за тестване на Системата за Медицински Прегледи. Използваме комбинация от unit тестове, интеграционни тестове и end-to-end тестове за осигуряване на високо качество на кода.

## Видове Тестове

### Unit Тестове

Unit тестовете тестват отделни компоненти в изолация.

```typescript
// src/services/doctor.service.test.ts
import { DoctorService } from './doctor.service';
import { Doctor } from '../models/doctor';

describe('DoctorService', () => {
  let service: DoctorService;

  beforeEach(() => {
    service = new DoctorService();
  });

  it('трябва да създаде нов доктор', async () => {
    const doctorData = {
      name: 'Д-р Иванов',
      specialty: 'Кардиолог',
      location: 'София'
    };

    const result = await service.createDoctor(doctorData);
    expect(result).toBeDefined();
    expect(result.name).toBe(doctorData.name);
  });
});
```

### Интеграционни Тестове

Интеграционните тестове тестват взаимодействието между компонентите.

```typescript
// src/tests/integration/doctor.test.ts
import request from 'supertest';
import { app } from '../../app';
import { db } from '../../config/database';

describe('Doctor API', () => {
  beforeAll(async () => {
    await db.connect();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  it('трябва да създаде и върне доктор', async () => {
    const response = await request(app)
      .post('/api/doctors')
      .send({
        name: 'Д-р Петров',
        specialty: 'Невролог',
        location: 'Пловдив'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

### End-to-End Тестове

End-to-end тестовете тестват цялото приложение от край до край.

```typescript
// cypress/integration/doctor.spec.ts
describe('Doctor Management', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'password');
  });

  it('трябва да създаде нов доктор', () => {
    cy.visit('/admin/doctors');
    cy.get('[data-testid="add-doctor-button"]').click();
    
    cy.get('[data-testid="doctor-name"]').type('Д-р Симеонов');
    cy.get('[data-testid="doctor-specialty"]').type('Педиатър');
    cy.get('[data-testid="doctor-location"]').type('Варна');
    
    cy.get('[data-testid="submit-button"]').click();
    
    cy.get('[data-testid="success-message"]').should('be.visible');
  });
});
```

## Конфигурация на Тестовете

### Jest Конфигурация

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ]
};
```

### Cypress Конфигурация

```javascript
// cypress.config.js
module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/integration/**/*.spec.ts',
    video: false,
    screenshotOnRunFailure: true
  }
};
```

## Организация на Тестовете

### Структура на Директориите

```
src/
  __tests__/
    unit/
    integration/
  services/
    __tests__/
  models/
    __tests__/
cypress/
  integration/
  fixtures/
  support/
```

### Именуване на Тестове

- Unit тестове: `*.test.ts`
- Интеграционни тестове: `*.integration.test.ts`
- E2E тестове: `*.spec.ts`

## Управление на Тестовите Данни

### Фабрики за Тестови Данни

```typescript
// src/tests/factories/doctor.factory.ts
import { Doctor } from '../../models/doctor';

export const createDoctorFactory = (overrides = {}) => {
  return {
    name: 'Д-р Иванов',
    specialty: 'Кардиолог',
    location: 'София',
    ...overrides
  };
};
```

### Мокове

```typescript
// src/tests/mocks/database.mock.ts
jest.mock('../../config/database', () => ({
  db: {
    query: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn()
  }
}));
```

## CI/CD Интеграция

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e
```

## Покритието на Кода

### Конфигурация на Istanbul

```javascript
// .nycrc
{
  "extends": "@istanbuljs/nyc-config-typescript",
  "all": true,
  "include": [
    "src/**/*.ts"
  ],
  "exclude": [
    "src/**/*.d.ts",
    "src/tests/**"
  ],
  "reporter": [
    "text",
    "lcov",
    "html"
  ]
}
```

## Добри Практики

### Писане на Добри Тестове

1. **Изолация**
   - Всеки тест трябва да бъде независим
   - Използвайте `beforeEach` и `afterEach` за почистване

2. **Описателни Имена**
   - Използвайте ясни и описателни имена на тестовете
   - Следвайте формат: "трябва да [действие] когато [условие]"

3. **Подготовка на Данни**
   - Използвайте фабрики за създаване на тестови данни
   - Избягвайте дублиране на данни между тестовете

4. **Избягване на Дублиране**
   - Използвайте споделени помощни функции
   - Създавайте базови класове за често използвани тестове

### Отстраняване на Проблеми

#### Бавни Тестове
- Използвайте `jest.setTimeout()` за дълги операции
- Оптимизирайте базата данни за тестове
- Използвайте in-memory база данни

#### Нестабилни Тестове
- Добавете retry логика
- Използвайте `cy.wait()` за асинхронни операции
- Проверете race conditions

#### Лоши Мокове
- Използвайте `jest.spyOn()` за частични мокове
- Проверете дали моковете са правилно възстановени
- Използвайте `jest.resetAllMocks()`

### Логване на Тестове

```typescript
// src/tests/helpers/logger.ts
export const testLogger = {
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
};
``` 