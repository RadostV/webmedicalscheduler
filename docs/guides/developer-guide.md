# Developer Guide

This guide provides information for developers who want to contribute to or extend the Medical Appointment System.

## Development Environment Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- PostgreSQL (v12 or higher)
- Git

### Setting Up the Development Environment

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/medical-appointment-system.git
   cd medical-appointment-system
   ```

2. Set up the backend:

   ```bash
   cd backend
   npm install
   ```

3. Set up the frontend:

   ```bash
   cd ../frontend
   npm install
   ```

4. Create a `.env` file in the backend directory with the following content:

   ```
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/medical_appointment"
   JWT_SECRET="your-jwt-secret-key"
   PORT=3001
   ```

5. Create a `.env.local` file in the frontend directory:

   ```
   REACT_APP_API_URL=http://localhost:3001/api
   ```

6. Initialize the database:

   ```bash
   cd ../backend
   npx prisma migrate dev
   ```

7. Seed the database (optional):
   ```bash
   npm run seed
   ```

## Project Structure

### Backend Structure

```
backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── models/         # Prisma schema and models
│   ├── routes/         # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── doctor.routes.ts
│   │   └── patient.routes.ts
│   ├── services/       # Business logic services
│   ├── utils/          # Utility functions
│   ├── index.ts        # Application entry point
│   └── swagger.ts      # Swagger configuration
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── migrations/     # Database migrations
└── package.json        # Dependencies and scripts
```

### Frontend Structure

```
frontend/
├── public/             # Static files
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── auth/       # Authentication components
│   │   ├── doctor/     # Doctor-specific components
│   │   ├── patient/    # Patient-specific components
│   │   └── shared/     # Shared components
│   ├── contexts/       # React Context providers
│   ├── pages/          # Page components
│   │   ├── doctor/     # Doctor pages
│   │   ├── patient/    # Patient pages
│   │   └── shared/     # Shared pages
│   ├── services/       # API service modules
│   │   ├── doctor/     # Doctor API services
│   │   ├── patient/    # Patient API services
│   │   └── shared/     # Shared API services
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main application component
│   └── index.tsx       # Application entry point
└── package.json        # Dependencies and scripts
```

## Development Workflow

### Running the Application

1. Start the backend server:

   ```bash
   cd backend
   npm run dev
   ```

2. In a separate terminal, start the frontend development server:

   ```bash
   cd frontend
   npm start
   ```

3. Access the application at http://localhost:3000

### Making Changes

#### Backend Changes

1. Make changes to the backend code
2. The server will automatically restart thanks to nodemon
3. Test your changes using Postman or the frontend application

#### Frontend Changes

1. Make changes to the frontend code
2. The development server will automatically reload
3. Test your changes in the browser

### Database Changes

1. Modify the Prisma schema in `backend/prisma/schema.prisma`
2. Generate a migration:
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```
3. Apply the migration to your database

## API Documentation

The backend API is documented using Swagger. You can access the Swagger UI at http://localhost:3001/api-docs when the backend server is running.

### Key API Endpoints

#### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

#### Doctor Endpoints

- `GET /api/doctors/appointments` - Get doctor's appointments
- `PATCH /api/doctors/appointments/:id/status` - Update appointment status
- `GET /api/doctors/availability` - Get doctor's availability
- `POST /api/doctors/availability` - Set doctor's availability
- `DELETE /api/doctors/availability/:id` - Delete availability slot
- `GET /api/doctors/:id/slots` - Get doctor's available time slots for a specific date

#### Patient Endpoints

- `GET /api/patients/appointments` - Get patient's appointments
- `POST /api/patients/appointments` - Schedule a new appointment
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor details

## Frontend Services

### Authentication Service

```typescript
interface authService {
  login(credentials: LoginRequest): Promise<AuthResponse>;
  register(data: RegisterRequest): Promise<AuthResponse>;
  logout(): void;
  getCurrentUser(): User | null;
  setAuthData(token: string, user: User): void;
}
```

### Doctor Service

```typescript
interface doctorService {
  getAppointments(): Promise<Appointment[]>;
  getAvailability(): Promise<Availability[]>;
  getDoctorAvailability(doctorId: string): Promise<Availability[]>;
  setAvailability(availabilityData: AvailabilityRequest): Promise<Availability>;
  deleteAvailability(availabilityId: string): Promise<void>;
  updateAppointmentStatus(
    appointmentId: string,
    status: AppointmentStatus
  ): Promise<Appointment>;
}
```

### Patient Service

```typescript
interface patientService {
  getAppointments(): Promise<Appointment[]>;
  scheduleAppointment(
    appointmentData: AppointmentRequest
  ): Promise<Appointment>;
  getDoctors(): Promise<Doctor[]>;
  getDoctorSlots(doctorId: string, date: string): Promise<string[]>;
}
```

## Testing

### Backend Testing

1. Run backend tests:
   ```bash
   cd backend
   npm test
   ```

### Frontend Testing

1. Run frontend tests:
   ```bash
   cd frontend
   npm test
   ```

## Building for Production

### Backend Build

```bash
cd backend
npm run build
```

The compiled output will be in the `dist` directory.

### Frontend Build

```bash
cd frontend
npm run build
```

The compiled output will be in the `build` directory.

## Deployment

### Manual Deployment

1. Build both the backend and frontend
2. Deploy the backend to your server
3. Deploy the frontend to a static file hosting service or CDN
4. Set up environment variables on your server

### Docker Deployment

1. Build the Docker images:

   ```bash
   docker-compose build
   ```

2. Run the containers:
   ```bash
   docker-compose up -d
   ```

## Contributing Guidelines

### Code Style

- Follow the ESLint and Prettier configurations provided in the project
- Use meaningful variable and function names
- Write comments for complex logic
- Follow the TypeScript best practices

### Git Workflow

1. Create a new branch for your feature or bug fix:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:

   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

3. Push your branch to the remote repository:

   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a pull request on GitHub

### Pull Request Process

1. Ensure your code passes all tests
2. Update documentation if necessary
3. Get at least one code review
4. Once approved, your PR will be merged

## Troubleshooting

### Common Development Issues

1. **Database connection issues**

   - Check that PostgreSQL is running
   - Verify your DATABASE_URL in the .env file
   - Ensure the database exists

2. **API connection issues**

   - Check that the backend server is running
   - Verify the REACT_APP_API_URL in the frontend .env.local file
   - Check for CORS issues in the browser console

3. **TypeScript errors**
   - Ensure all types are properly defined
   - Run `npm run typecheck` to check for type errors

### Getting Help

If you encounter any issues not covered in this guide, please:

1. Check the existing GitHub issues
2. Create a new issue if needed
3. Reach out to the development team
