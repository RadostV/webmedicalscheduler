# Medical Scheduling Appointment Application

You are tasked with developing a full-stack web-based medical scheduling appointment application. The application must provide separate portals for patients and doctors, enabling patients to view and schedule appointments and doctors to manage their schedules and availability. This prompt outlines all requirements for the frontend (React) and backend (Node.js with Express.js), including the technology stack, components, API endpoints, database schema, security measures, and deployment instructions.

## Application Overview

- **Purpose**: A web platform for managing medical appointments.
- **Users**:
  - **Patients**: Can log in to view their appointments and schedule new ones by selecting a doctor, date, and available time slot.
  - **Doctors**: Can log in to view their appointment schedules and set their availability.
- **Access**: Users must authenticate to access their respective portals (patient or doctor).

## Technology Stack

- **Frontend**: React.js with React Router for navigation.
- **Backend**: Node.js with Express.js.
- **Database**: SQLite3 with Prisma ORM for type-safe database operations.
- **Authentication**: JSON Web Tokens (JWT) for secure user authentication.
- **Styling**: Material-UI for a consistent and responsive UI (with CSS modules as a fallback).
- **Additional Libraries**:
  - react-datepicker for date selection.
  - axios for API requests.
  - fullcalendar (optional) for doctor schedule visualization.

## Frontend Requirements

### 1. Application Structure

- Build a single-page application (SPA) using React.js.
- **Routes**:
  - `/login`: Public login page for all users.
  - `/patient`: Protected patient portal (accessible only to authenticated patients).
  - `/doctor`: Protected doctor portal (accessible only to authenticated doctors).
- Use React Context API (AuthContext) to manage global authentication state (user details and JWT token).

### 2. Components

Below are the required components, their purposes, and key features:

#### Top-Level Component: App

- Sets up React Router and wraps the app with AuthContext.Provider.
- Renders routes based on authentication status.

#### Authentication Components

##### Login:

- A form with username and password fields.
- Submits credentials to POST `/api/auth/login` and stores the returned JWT and user details in AuthContext.
- Redirects to `/patient` or `/doctor` based on user type after successful login.
- Displays error messages for invalid credentials.

##### ProtectedRoute:

- A custom component that checks AuthContext for a valid token and user type.
- Redirects unauthorized users to `/login`.

#### Patient Portal Components

##### PatientPortal:

- Container component with a Navbar and routes for patient features.
- Routes: `/patient/appointments` (default), `/patient/schedule`.

##### AppointmentList:

- Fetches and displays the patient's appointments from GET `/api/patients/appointments`.
- Shows columns: Doctor name, Date, Time, Status.
- Includes a LoadingSpinner during data fetch and an ErrorMessage for failures.

##### AppointmentScheduler:

- Form to schedule a new appointment:
  - **DoctorSelector**: Dropdown to select a doctor (fetched from GET `/api/doctors` if available, or hardcoded list).
  - **DatePicker**: Uses react-datepicker to select a date.
  - **TimeSlotSelector**: Dropdown of available time slots (fetched from GET `/api/doctors/:id/slots?date=YYYY-MM-DD` based on selected doctor and date).
- Submits to POST `/api/patients/appointments` with selected doctor, date, and time.
- Shows a Modal for confirmation before submission.

#### Doctor Portal Components

##### DoctorPortal:

- Container component with a Navbar and routes for doctor features.
- Routes: `/doctor/schedule` (default), `/doctor/availability`.

##### Schedule:

- Fetches and displays the doctor's appointments from GET `/api/doctors/appointments`.
- Options: List view (Doctor name, Patient name, Date, Time, Status) or calendar view (using fullcalendar).
- Includes a LoadingSpinner and ErrorMessage.

##### AvailabilityManager:

- Form to set availability:
  - Fields: Day of the week (dropdown), Start Time (e.g., 9:00 AM), End Time (e.g., 5:00 PM).
- Submits to POST `/api/doctors/availability`.
- Displays current availability fetched from GET `/api/doctors/availability`.

#### Shared Components

##### Navbar:

- Navigation bar within portals with links to portal-specific routes (e.g., "Appointments" and "Schedule" for patients).
- Includes a "Logout" button that clears AuthContext and redirects to `/login`.

##### Modal:

- Reusable component for confirmations (e.g., "Confirm appointment booking?").
- Accepts title, message, and callback props (onConfirm, onCancel).

##### LoadingSpinner:

- Displays a spinning icon (e.g., Material-UI CircularProgress) during API calls.

##### ErrorMessage:

- Displays error text in red (e.g., "Failed to load appointments").

### 3. State Management

- **Global State**: Use AuthContext to store:
  - user: Object with id, username, type (patient/doctor).
  - token: JWT string.
  - Functions: login (set user and token), logout (clear state).
- **Local State**: Use useState or useReducer within components for:
  - Form inputs (e.g., selected doctor, date, time).
  - API response data (e.g., appointments, time slots).

### 4. API Integration

- Use axios for all HTTP requests.
- Include the JWT token in the Authorization header (Bearer <token>) for protected endpoints.
- Handle loading states (show LoadingSpinner) and errors (show ErrorMessage) for each API call.

### 5. UI Enhancements

- Use Material-UI for buttons, forms, tables, and other UI elements.
- Ensure the application is responsive (mobile-friendly) using Material-UI's grid system.
- Use react-datepicker for date selection in AppointmentScheduler.

## Backend Requirements

### 1. Server Setup

- Create a Node.js server using Express.js.
- Install dependencies: express, mongoose, jsonwebtoken, bcryptjs, cors, dotenv.
- Use middleware:
  - cors: Enable cross-origin requests.
  - express.json(): Parse JSON request bodies.
  - Custom JWT middleware: Verify tokens for protected routes.

### 2. Database Schema (SQLite with Prisma)

The following schema will be defined in Prisma:

```prisma
// Schema for the Medical Scheduling Application

model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  password  String   // Hashed with bcrypt
  type      String   // "patient" or "doctor"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  doctorProfile     Doctor?        // If user is a doctor
  patientAppointments Appointment[] @relation("PatientAppointments")
  doctorAppointments  Appointment[] @relation("DoctorAppointments")
}

model Doctor {
  id         Int      @id @default(autoincrement())
  userId     Int      @unique
  specialty  String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Relations
  user         User          @relation(fields: [userId], references: [id])
  availability Availability[]
}

model Appointment {
  id        Int      @id @default(autoincrement())
  patientId Int
  doctorId  Int
  dateTime  DateTime
  status    String   @default("scheduled") // "scheduled", "completed", "cancelled"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  patient   User     @relation("PatientAppointments", fields: [patientId], references: [id])
  doctor    User     @relation("DoctorAppointments", fields: [doctorId], references: [id])
}

model Availability {
  id        Int      @id @default(autoincrement())
  doctorId  Int
  dayOfWeek Int      // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime String   // Format: "HH:mm"
  endTime   String   // Format: "HH:mm"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  doctor    Doctor   @relation(fields: [doctorId], references: [id])
}
```

### 3. API Endpoints

Implement the following RESTful endpoints:

#### Authentication:

**POST /api/auth/login**:

- Request: `{ username, password }`.
- Logic: Find user by username, verify password with bcrypt, return JWT with id, username, and type.
- Response: `{ token, user: { id, username, type } }` (200) or `{ error: "Invalid credentials" }` (401).

#### Patient Endpoints (Protected):

**GET /api/patients/appointments**:

- Logic: Fetch appointments where patientId matches the authenticated user's id.
- Response: Array of appointments (200) or `{ error: "Failed to fetch" }` (500).

**POST /api/patients/appointments**:

- Request: `{ doctorId, dateTime }`.
- Logic: Check slot availability (no overlapping appointments), create new appointment with patientId from JWT.
- Response: `{ id, patientId, doctorId, dateTime, status }` (201) or `{ error: "Slot unavailable" }` (400).

#### Doctor Endpoints (Protected):

**GET /api/doctors/appointments**:

- Logic: Fetch appointments where doctorId matches the authenticated user's id.
- Response: Array of appointments (200) or `{ error: "Failed to fetch" }` (500).

**GET /api/doctors/availability**:

- Logic: Fetch availability records for the authenticated doctor.
- Response: Array of availability objects (200) or `{ error: "Failed to fetch" }` (500).

**POST /api/doctors/availability**:

- Request: `{ dayOfWeek, startTime, endTime }`.
- Logic: Create or update availability for the authenticated doctor.
- Response: `{ id, doctorId, dayOfWeek, startTime, endTime }` (201) or `{ error: "Invalid input" }` (400).

**GET /api/doctors/:id/slots?date=YYYY-MM-DD**:

- Logic:
  1. Get doctor's availability for the day of the week matching the date.
  2. Generate 30-minute slots between startTime and endTime.
  3. Exclude slots already booked (check Appointment collection).
- Response: Array of available slots (e.g., `["09:00", "09:30", ...]`) (200) or `{ error: "No availability" }` (404).

### 4. Business Logic

#### Slot Generation:

- For a given date and doctor, fetch availability for that day of the week.
- Generate 30-minute intervals (e.g., 09:00, 09:30, ..., 17:00 if startTime is 09:00 and endTime is 17:00).
- Filter out slots that overlap with existing appointments.

#### Booking Logic:

- Before creating an appointment, verify the slot is available by checking for conflicts in the Appointment collection.

### 5. Security

- Use HTTPS (configure in production).
- **JWT Authentication**:
  - Generate tokens with a secret key (stored in .env as JWT_SECRET).
  - Middleware to verify tokens for all `/api/patients/*` and `/api/doctors/*` routes.
- **Password Hashing**: Use bcryptjs to hash passwords before saving to the database.

## Additional Requirements

### 1. User Experience Enhancements

- Ensure the UI is responsive using Material-UI's responsive design features.
- Use react-datepicker in AppointmentScheduler for intuitive date selection.
- Optionally, integrate fullcalendar in Schedule for a calendar view of appointments.

### 2. Testing

- Write unit tests for:
  - **Frontend**: Login, ProtectedRoute, AppointmentScheduler (using Jest and React Testing Library).
  - **Backend**: API endpoints (using Jest or Mocha).
- Test edge cases (e.g., double-booking, invalid credentials).

### 3. Deployment

- **Frontend**: Deploy to Vercel.
  - Steps: Push to GitHub, connect to Vercel, set environment variables (e.g., API base URL).
- **Backend**: Deploy to Heroku.
  - Steps: Add Procfile (web: node server.js), connect MongoDB (e.g., MongoDB Atlas), set environment variables (MONGO_URI, JWT_SECRET).
- Use a CI/CD pipeline (e.g., GitHub Actions) for automated testing and deployment.

## Implementation Steps

### Setup:

- **Frontend**: Run `npx create-react-app medical-scheduler --template typescript` and install dependencies (react-router-dom, axios, material-ui, react-datepicker).
- **Backend**: Initialize a Node.js project (`npm init`), install dependencies, and set up MongoDB with Mongoose.

### Backend Development:

1. Create server, define models, and implement API endpoints.
2. Add authentication and business logic.

### Frontend Development:

1. Set up routing and AuthContext.
2. Build authentication components (Login, ProtectedRoute).
3. Develop patient portal (PatientPortal, AppointmentList, AppointmentScheduler).
4. Develop doctor portal (DoctorPortal, Schedule, AvailabilityManager).

### Integration:

1. Connect frontend to backend APIs with axios.
2. Test end-to-end workflows (login, scheduling, availability management).

### Enhancements:

1. Add loading states, error handling, and modals.
2. Ensure responsiveness and polish UI with Material-UI.

### Testing & Deployment:

1. Write and run tests.
2. Deploy to Vercel (frontend) and Heroku (backend).
