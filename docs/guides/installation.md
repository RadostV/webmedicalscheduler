# Installation Guide

This guide will walk you through the steps to set up and run the Medical Appointment System locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (v6 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v12 or higher)
- [Git](https://git-scm.com/) (for cloning the repository)

## Clone the Repository

```bash
git clone https://github.com/yourusername/medical-appointment-system.git
cd medical-appointment-system
```

## Database Setup

1. Create a PostgreSQL database for the application:

```bash
psql -U postgres
CREATE DATABASE medical_appointment;
\q
```

2. Update the database connection settings in the backend:

Create a `.env` file in the `backend` directory with the following content (adjust values as needed):

```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/medical_appointment"
JWT_SECRET="your-jwt-secret-key"
PORT=3001
```

## Backend Setup

1. Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

2. Run database migrations to set up the schema:

```bash
npx prisma migrate dev
```

3. (Optional) Seed the database with sample data:

```bash
npm run seed
```

4. Start the backend server:

```bash
npm run dev
```

The backend API should now be running at `http://localhost:3001`.

## Frontend Setup

1. Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

2. Create a `.env.local` file in the frontend directory with the API URL:

```
REACT_APP_API_URL=http://localhost:3001/api
```

3. Start the frontend development server:

```bash
npm start
```

The frontend application should now be running at `http://localhost:3000`.

## Accessing the Application

Once both the backend and frontend are running, you can access the application in your web browser:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:3001/api](http://localhost:3001/api)
- API Documentation: [http://localhost:3001/api-docs](http://localhost:3001/api-docs) (Swagger UI)

## Demo Accounts

If you ran the seed script, you should have access to the following demo accounts:

### Doctor Account

- Username: doctor1
- Password: password

### Patient Account

- Username: patient1
- Password: password

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues, verify:

- PostgreSQL is running
- Database credentials in `.env` are correct
- The database exists

Try running `npx prisma db push` to ensure the schema is properly applied.

### API Connection Issues

If the frontend cannot connect to the backend:

- Verify both servers are running
- Check CORS settings in the backend
- Ensure the API URL in the frontend environment is correct

### Port Conflicts

If port 3000 or 3001 is already in use, you can change the ports:

- For backend: Update the `PORT` value in the `.env` file
- For frontend: Create a `.env.local` file with `PORT=3002` (or any other available port)

## Docker Setup (Optional)

If you prefer to use Docker:

1. Ensure Docker and Docker Compose are installed
2. Create a `docker-compose.yml` file in the root directory:

```yaml
version: "3"

services:
  database:
    image: postgres:13
    environment:
      POSTGRES_DB: medical_appointment
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://postgres:password@database:5432/medical_appointment
      JWT_SECRET: your-jwt-secret-key
      PORT: 3001
    ports:
      - "3001:3001"
    depends_on:
      - database

  frontend:
    build: ./frontend
    environment:
      REACT_APP_API_URL: http://localhost:3001/api
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

3. Run the application with Docker Compose:

```bash
docker-compose up
```

This will start the database, backend, and frontend services together.
