import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import swaggerUi from 'swagger-ui-express';
import { specs } from './swagger';
import authRoutes from './routes/auth.routes';
import patientRoutes, { publicRouter as patientPublicRoutes } from './routes/patient.routes';
import doctorRoutes, { publicRouter as doctorPublicRoutes } from './routes/doctor.routes';
import { errorHandler } from './middleware/error.middleware';
import { authMiddleware } from './middleware/auth.middleware';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Create Prisma client
export const prisma = new PrismaClient();

// Middleware
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/auth', authRoutes);
// Mount public patient routes first
app.use('/api/patients', patientPublicRoutes);
// Then mount authenticated patient routes
app.use('/api/patients', authMiddleware, patientRoutes);
// Mount public doctor routes first
app.use('/api/doctors', doctorPublicRoutes);
// Then mount authenticated doctor routes
app.use('/api/doctors', authMiddleware, doctorRoutes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
});
