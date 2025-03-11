# Medical Scheduling Application - Frontend

This is the frontend for the Medical Scheduling Appointment Application, a web-based system that provides separate portals for patients and doctors to manage medical appointments.

## Features

- Patient Portal:

  - View appointments
  - Schedule new appointments
  - Select doctors, dates, and available time slots

- Doctor Portal:
  - View appointment schedule
  - Manage availability
  - View calendar of appointments

## Technology Stack

- **React** - JavaScript library for building user interfaces
- **TypeScript** - Superset of JavaScript that adds static types
- **React Router** - Routing library for React
- **Material-UI** - UI component library based on Material Design
- **Axios** - Promise-based HTTP client
- **Formik & Yup** - Form handling and validation
- **@tanstack/react-query** - Data fetching and caching library
- **FullCalendar** - Calendar component for displaying appointments
- **React DatePicker** - Date selection component
- **date-fns** - JavaScript date utility library
- **React Toastify** - Toast notifications

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm (v6+)

### Installation

1. Clone the repository
2. Navigate to the frontend directory
3. Install dependencies:

```bash
npm install
```

### Development

To start the development server:

```bash
npm start
```

The application will be available at `http://localhost:3000`

### Building for Production

To create a production build:

```bash
npm run build
```

## Project Structure

```
frontend/
├── public/                 # Public assets
├── src/                    # Source code
│   ├── assets/             # Static assets like images
│   │   ├── shared/         # Shared components (navbar, modals, etc.)
│   │   ├── patient/        # Patient-specific components
│   │   └── doctor/         # Doctor-specific components
│   ├── contexts/           # React contexts
│   │   ├── shared/         # Shared contexts
│   │   ├── patient/        # Patient-specific contexts
│   │   └── doctor/         # Doctor-specific contexts
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components
│   │   ├── shared/         # Shared pages (login, etc.)
│   │   ├── patient/        # Patient portal pages
│   │   └── doctor/         # Doctor portal pages
│   ├── services/           # API services
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main App component
│   └── index.tsx           # Application entry point
└── package.json            # Project dependencies and scripts
```

## License

This project is licensed under the MIT License.
