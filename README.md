# Medical Scheduling Appointment Application

A full-stack web application for medical appointment scheduling that provides separate portals for patients and doctors, allowing patients to book appointments and doctors to manage their schedules.

## Project Overview

- **Purpose**: A web platform for managing medical appointments.
- **Users**:
  - **Patients**: Can log in to view their appointments and schedule new ones by selecting a doctor, date, and available time slot.
  - **Doctors**: Can log in to view their appointment schedules and set their availability.
- **Access**: Users must authenticate to access their respective portals (patient or doctor).

## Technology Stack

### Frontend

- **React** with TypeScript
- **Material-UI** for UI components
- **React Router** for navigation
- **Formik & Yup** for form handling
- **@tanstack/react-query** for data fetching
- **FullCalendar** for calendar views
- **React DatePicker** for date selection

### Backend

- **Node.js** with **Express.js**
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **cors, helmet** for security

## Repository Structure

```
doc_project/
├── frontend/             # React frontend application
├── backend/              # Node.js/Express backend application
└── README.md             # Project documentation
```

## Features

### Patient Portal

- Secure login/authentication
- View all upcoming and past appointments
- Schedule new appointments by:
  - Selecting a doctor
  - Choosing an available date
  - Picking an available time slot
- Cancel or reschedule existing appointments

### Doctor Portal

- Secure login/authentication
- View daily, weekly, and monthly schedule
- Set availability for specific days and times
- View patient appointment details
- Mark appointments as completed or cancelled

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm (v6+)
- MongoDB (v4+)

### Setting Up the Frontend

1. Navigate to the frontend directory
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The frontend will be accessible at http://localhost:3000

### Setting Up the Backend

1. Navigate to the backend directory
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medical-scheduler
JWT_SECRET=your_jwt_secret
```

4. Start the server:

```bash
npm start
```

The API will be accessible at http://localhost:5000

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login

### Patient Endpoints

- `GET /api/patients/appointments` - Get patient appointments
- `POST /api/patients/appointments` - Create new appointment

### Doctor Endpoints

- `GET /api/doctors/appointments` - Get doctor appointments
- `GET /api/doctors/availability` - Get doctor availability
- `POST /api/doctors/availability` - Set doctor availability
- `GET /api/doctors/:id/slots` - Get available time slots for a doctor

## License

This project is licensed under the MIT License.
