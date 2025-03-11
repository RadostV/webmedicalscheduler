# Testing Guide

This guide provides detailed information about testing procedures and strategies for the Medical Appointment System.

## Overview

Testing is a critical part of the development process for the Medical Appointment System. This guide covers the different types of tests implemented in the system, how to run them, and best practices for writing new tests.

## Testing Framework

The Medical Appointment System uses the following testing frameworks and tools:

### Backend Testing

- **Jest**: Main testing framework
- **Supertest**: HTTP assertions for API testing
- **Prisma Jest**: For mocking Prisma client

### Frontend Testing

- **Jest**: Main testing framework
- **React Testing Library**: For testing React components
- **Mock Service Worker (MSW)**: For mocking API requests
- **Cypress**: For end-to-end testing

## Setting Up the Test Environment

### Backend Test Setup

1. Create a `.env.test` file in the `backend` directory with test-specific environment variables:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/medical_appointment_test"
JWT_SECRET="test-jwt-secret"
PORT=3002
NODE_ENV=test
```

2. Create a test database:

```bash
psql -U postgres
CREATE DATABASE medical_appointment_test;
\q
```

3. Run migrations on the test database:

```bash
cd backend
NODE_ENV=test npx prisma migrate deploy
```

### Frontend Test Setup

Create a `.env.test` file in the `frontend` directory:

```
REACT_APP_API_URL=http://localhost:3002/api
REACT_APP_ENV=test
```

## Running Tests

### Backend Tests

To run all backend tests:

```bash
cd backend
npm test
```

To run a specific test file:

```bash
npm test -- controllers/auth.controller.test.ts
```

To run tests with coverage report:

```bash
npm test -- --coverage
```

### Frontend Tests

To run all frontend tests:

```bash
cd frontend
npm test
```

To run a specific test file:

```bash
npm test -- components/LoginForm.test.tsx
```

To run tests with coverage report:

```bash
npm test -- --coverage
```

### End-to-End Tests

To run Cypress end-to-end tests:

```bash
cd frontend
npm run cypress:open
```

This will open the Cypress test runner. Select a test to run from the Cypress interface.

## Test Structure

### Backend Test Structure

Backend tests are organized by module and functionality:

```
backend/src/__tests__/
├── controllers/        # Tests for API controllers
├── middleware/         # Tests for middleware functions
├── services/           # Tests for business logic services
└── utils/              # Tests for utility functions
```

### Frontend Test Structure

Frontend tests are colocated with the components they test:

```
frontend/src/
├── components/
│   ├── LoginForm.tsx
│   ├── LoginForm.test.tsx
│   ├── RegisterForm.tsx
│   └── RegisterForm.test.tsx
├── pages/
│   ├── doctor/
│   │   ├── Schedule.tsx
│   │   └── Schedule.test.tsx
│   └── patient/
│       ├── AppointmentScheduler.tsx
│       └── AppointmentScheduler.test.tsx
└── services/
    ├── auth.service.ts
    └── auth.service.test.ts
```

### End-to-End Test Structure

End-to-end tests are organized by user flow:

```
frontend/cypress/e2e/
├── auth/
│   ├── login.cy.ts
│   └── register.cy.ts
├── doctor/
│   ├── availability.cy.ts
│   └── appointments.cy.ts
└── patient/
    ├── schedule-appointment.cy.ts
    └── view-appointments.cy.ts
```

## Writing Tests

### Backend Test Examples

#### Controller Test Example

```typescript
// auth.controller.test.ts
import request from "supertest";
import { app } from "../../app";
import { prisma } from "../../models/prisma";

beforeAll(async () => {
  // Setup test database
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Auth Controller", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new patient user", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "testpatient",
        password: "password123",
        accountType: "PATIENT",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toHaveProperty("id");
      expect(res.body.user.username).toBe("testpatient");
      expect(res.body.user.accountType).toBe("PATIENT");
    });

    it("should register a new doctor user with specialty", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "testdoctor",
        password: "password123",
        accountType: "DOCTOR",
        specialty: "Cardiology",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toHaveProperty("id");
      expect(res.body.user.username).toBe("testdoctor");
      expect(res.body.user.accountType).toBe("DOCTOR");
      expect(res.body.user.doctorProfile).toHaveProperty(
        "specialty",
        "Cardiology"
      );
    });

    it("should return 400 if username already exists", async () => {
      // Try to register with the same username
      const res = await request(app).post("/api/auth/register").send({
        username: "testpatient",
        password: "password123",
        accountType: "PATIENT",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });

  // More tests for login and other auth endpoints...
});
```

#### Service Test Example

```typescript
// doctor.service.test.ts
import { doctorService } from "../../services/doctor.service";
import { prisma } from "../../models/prisma";

// Mock Prisma client
jest.mock("../../models/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    availability: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    appointment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe("Doctor Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAvailability", () => {
    it("should return availability for a doctor", async () => {
      const mockAvailability = [
        {
          id: "1",
          doctorId: "doctor1",
          dayOfWeek: 1,
          startTime: "09:00",
          endTime: "17:00",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.availability.findMany as jest.Mock).mockResolvedValue(
        mockAvailability
      );

      const result = await doctorService.getAvailability("doctor1");

      expect(prisma.availability.findMany).toHaveBeenCalledWith({
        where: { doctorId: "doctor1" },
      });
      expect(result).toEqual(mockAvailability);
    });
  });

  // More tests for other service methods...
});
```

### Frontend Test Examples

#### Component Test Example

```typescript
// LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../contexts/AuthContext";
import LoginForm from "./LoginForm";
import { authService } from "../../services/shared/auth.service";

// Mock auth service
jest.mock("../../services/shared/auth.service");

describe("LoginForm", () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  it("renders login form correctly", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByText(/register here/i)).toBeInTheDocument();
  });

  it("handles login submission correctly", async () => {
    const mockLoginSuccess = {
      token: "fake-token",
      user: {
        id: "1",
        username: "testuser",
        accountType: "PATIENT",
      },
    };

    (authService.login as jest.Mock).mockResolvedValue(mockLoginSuccess);

    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </BrowserRouter>
    );

    // Fill the form
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // Check if login function was called with correct params
    expect(authService.login).toHaveBeenCalledWith({
      username: "testuser",
      password: "password123",
    });

    // Check for success state
    await waitFor(() => {
      expect(
        screen.queryByText(/invalid credentials/i)
      ).not.toBeInTheDocument();
    });
  });

  it("displays error message on login failure", async () => {
    // Mock failed login
    (authService.login as jest.Mock).mockRejectedValue(
      new Error("Invalid credentials")
    );

    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </BrowserRouter>
    );

    // Fill the form
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpassword" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
```

#### Service Test Example

```typescript
// auth.service.test.ts
import { authService } from "./auth.service";
import axios from "axios";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Auth Service", () => {
  beforeEach(() => {
    // Clear local storage between tests
    localStorage.clear();

    // Reset axios mocks
    jest.resetAllMocks();
  });

  describe("login", () => {
    it("should make a POST request to login endpoint", async () => {
      const mockResponse = {
        data: {
          token: "fake-token",
          user: {
            id: 1,
            username: "testuser",
            type: "patient",
          },
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await authService.login({
        username: "testuser",
        password: "password123",
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        { username: "testuser", password: "password123" }
      );

      // Check if the data is properly converted
      expect(result).toEqual({
        token: "fake-token",
        user: {
          id: "1", // Should be converted to string
          username: "testuser",
          type: "patient",
        },
      });

      // Check if token is stored in localStorage
      expect(localStorage.getItem("token")).toBe("fake-token");
    });

    it("should throw an error if login fails", async () => {
      const errorMessage = "Invalid credentials";
      mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage));

      await expect(
        authService.login({ username: "testuser", password: "wrongpassword" })
      ).rejects.toThrow(errorMessage);

      // Check that nothing was stored in localStorage
      expect(localStorage.getItem("token")).toBeNull();
    });
  });

  // More tests for other auth service methods...
});
```

### End-to-End Test Example

```typescript
// login.cy.ts
describe("Login Flow", () => {
  beforeEach(() => {
    // Reset application state
    cy.visit("/");
  });

  it("should allow a user to log in", () => {
    // Intercept the login API call
    cy.intercept("POST", "/api/auth/login", {
      statusCode: 200,
      body: {
        token: "fake-token",
        user: {
          id: "1",
          username: "testuser",
          accountType: "PATIENT",
        },
      },
    }).as("loginRequest");

    // Navigate to login page
    cy.visit("/login");

    // Fill the login form
    cy.get('input[name="username"]').type("testuser");
    cy.get('input[name="password"]').type("password123");

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Wait for the API call to complete
    cy.wait("@loginRequest");

    // Verify we're redirected to the patient dashboard
    cy.url().should("include", "/patient/dashboard");

    // Verify user information is displayed
    cy.contains("Welcome, testuser");
  });

  it("should show error message for invalid credentials", () => {
    // Intercept the login API call with an error response
    cy.intercept("POST", "/api/auth/login", {
      statusCode: 401,
      body: {
        errors: [{ msg: "Invalid credentials" }],
      },
    }).as("loginRequest");

    // Navigate to login page
    cy.visit("/login");

    // Fill the login form
    cy.get('input[name="username"]').type("testuser");
    cy.get('input[name="password"]').type("wrongpassword");

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Wait for the API call to complete
    cy.wait("@loginRequest");

    // Verify we're still on the login page
    cy.url().should("include", "/login");

    // Verify error message is displayed
    cy.contains("Invalid credentials");
  });

  it("should navigate to registration page when register link is clicked", () => {
    // Navigate to login page
    cy.visit("/login");

    // Click the register link
    cy.contains("Register here").click();

    // Verify we're on the registration page
    cy.url().should("include", "/register");
  });
});
```

## Test Coverage

### Calculating Test Coverage

To calculate test coverage for both backend and frontend:

```bash
# Backend
cd backend
npm test -- --coverage

# Frontend
cd frontend
npm test -- --coverage
```

Coverage reports will be generated in `backend/coverage` and `frontend/coverage` directories respectively.

### Coverage Thresholds

The project aims to maintain the following test coverage thresholds:

- Backend:

  - Statements: 80%
  - Branches: 75%
  - Functions: 80%
  - Lines: 80%

- Frontend:
  - Statements: 70%
  - Branches: 65%
  - Functions: 70%
  - Lines: 70%

## Integration with CI/CD

Tests are automatically run as part of the CI/CD pipeline. The GitHub Actions workflow is configured to:

1. Run all tests on every pull request
2. Run all tests on pushes to the main branch
3. Generate and store test coverage reports as artifacts
4. Fail the build if tests fail or if coverage drops below thresholds

## Mocking Strategies

### Backend Mocking

- **Database Mocking**: Using jest-mock-extended to mock Prisma client
- **Authentication Mocking**: Creating test JWT tokens for protected endpoints
- **External Services Mocking**: Mocking any external API calls

### Frontend Mocking

- **API Mocking**: Using Mock Service Worker (MSW) to intercept and mock API requests
- **Context Mocking**: Providing test values for React Context providers
- **Router Mocking**: Using MemoryRouter for React Router testing

## Testing Best Practices

### General Best Practices

1. Write tests before or alongside code (Test-Driven Development)
2. Keep tests small, focused, and fast
3. Use descriptive test names that explain what is being tested
4. Organize tests to mirror the structure of the code they're testing
5. Don't test implementation details, test behavior

### Backend Testing Best Practices

1. Test API endpoints with supertest to verify status codes and response bodies
2. Mock database operations to keep tests fast and isolated
3. Test both successful and error cases
4. Use separate test database to avoid affecting development data

### Frontend Testing Best Practices

1. Test components in isolation with proper mocks for dependencies
2. Focus on testing user interactions and component behavior
3. Use data-testid attributes for test-specific element selection
4. Test form validations thoroughly
5. Avoid testing third-party components, focus on your integration with them

### End-to-End Testing Best Practices

1. Focus on critical user flows (login, registration, appointment scheduling)
2. Keep E2E tests focused on one flow at a time
3. Use intercepts to mock API responses for predictable test state
4. Test error states and edge cases

## Troubleshooting Tests

### Common Issues

1. **Tests failing in CI but passing locally**:

   - Ensure tests don't rely on specific timeouts or race conditions
   - Check for environment-specific configurations
   - Verify all dependencies are properly installed in CI

2. **Flaky tests**:

   - Avoid depending on specific timing
   - Use waitFor and findBy\* methods in React Testing Library
   - Ensure test isolation (no test should depend on another)

3. **Jest snapshot test failures**:

   - Check if the changes are expected
   - Update snapshots with `npm test -- -u` if changes are intentional

4. **Database-related test failures**:
   - Ensure test database is properly set up
   - Verify migrations have been applied
   - Make sure tests clean up after themselves

### Debugging Tests

For detailed debugging of Jest tests:

```bash
# Backend
cd backend
node --inspect-brk node_modules/.bin/jest --runInBand controllers/auth.controller.test.ts

# Frontend
cd frontend
node --inspect-brk node_modules/.bin/jest --runInBand components/LoginForm.test.tsx
```

Then open Chrome DevTools at chrome://inspect to connect to the debugger.

For Cypress tests, use the Cypress UI which has built-in debugging tools.

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Mock Service Worker Documentation](https://mswjs.io/docs/)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
