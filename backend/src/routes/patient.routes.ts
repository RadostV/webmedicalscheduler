import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { prisma } from '../index';
import { validateRequest } from '../middleware/validate.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import multer from 'multer';

const router = Router();

// Apply authentication middleware to all patient routes
router.use(authenticateToken);

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

interface CreateAppointmentRequest {
  doctorId: string; // This is the user ID of the doctor
  dateTime: string;
  symptoms?: string;
  consultationAnalysis?: string;
  description?: string;
  prescriptionFile?: Buffer; // Binary data of the PDF file
  prescriptionFileType?: string; // MIME type of the file
}

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateAppointmentRequest:
 *       type: object
 *       required:
 *         - doctorId
 *         - dateTime
 *       properties:
 *         doctorId:
 *           type: string
 *           description: The user ID of the doctor (not the doctor profile ID)
 *         dateTime:
 *           type: string
 *           format: date-time
 *           description: Date and time of the appointment
 */

/**
 * @swagger
 * /api/patients/appointments:
 *   get:
 *     summary: Get patient's appointments
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   dateTime:
 *                     type: string
 *                     format: date-time
 *                   doctor:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       username:
 *                         type: string
 *                       doctorProfile:
 *                         type: object
 *                         properties:
 *                           specialty:
 *                             type: string
 *       500:
 *         description: Failed to fetch appointments
 */
router.get('/appointments', async (req: Request, res: Response): Promise<Response> => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: req.user!.id,
      },
      include: {
        doctor: {
          select: {
            id: true,
            username: true,
            doctorProfile: {
              select: {
                id: true,
                specialty: true,
              },
            },
          },
        },
      },
      orderBy: {
        dateTime: 'asc',
      },
    });

    // Transform the response to match the frontend types
    const formattedAppointments = appointments.map((appointment) => ({
      id: appointment.id.toString(),
      patientId: appointment.patientId.toString(),
      doctorId: appointment.doctorId.toString(),
      dateTime: appointment.dateTime.toISOString(),
      status: appointment.status,
      doctor: {
        id: appointment.doctor.doctorProfile?.id.toString() || '',
        userId: appointment.doctor.id.toString(),
        name: appointment.doctor.username,
        specialty: appointment.doctor.doctorProfile?.specialty || '',
      },
    }));

    return res.json(formattedAppointments);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Create appointment validation
const createAppointmentValidation = [
  body('doctorId').isString().withMessage('Doctor ID must be a string'),
  body('dateTime').isISO8601().withMessage('Invalid date format'),
  body('symptoms').optional().isString().withMessage('Symptoms must be a string'),
  body('consultationAnalysis').optional().isString().withMessage('Consultation analysis must be a string'),
  body('description').optional().isString().withMessage('Description must be a string'),
];

/**
 * @swagger
 * /api/patients/appointments:
 *   post:
 *     summary: Create a new appointment
 *     description: Creates a new appointment using the doctor's user ID (not the doctor profile ID)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAppointmentRequest'
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 dateTime:
 *                   type: string
 *                   format: date-time
 *                 doctor:
 *                   type: object
 *       400:
 *         description: Invalid request or doctor not available
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Failed to create appointment
 */
router.post(
  '/appointments',
  upload.single('prescriptionFile'),
  createAppointmentValidation,
  validateRequest,
  async (req: Request<{}, {}, CreateAppointmentRequest>, res: Response): Promise<Response> => {
    try {
      const { doctorId, dateTime, symptoms, consultationAnalysis, description } = req.body;
      const prescriptionFile = req.file?.buffer; // Binary data
      const prescriptionFileType = req.file?.mimetype; // MIME type
      const appointmentDate = new Date(dateTime);

      console.log('Creating appointment:', {
        doctorId,
        dateTime,
        appointmentDate: appointmentDate.toISOString(),
        appointmentLocalTime: appointmentDate.toString(),
        symptoms,
        consultationAnalysis,
        description,
        prescriptionFile,
        prescriptionFileType,
      });

      // Check if doctor exists by user ID
      const doctor = await prisma.doctor.findFirst({
        where: {
          userId: parseInt(doctorId),
        },
        include: {
          user: true,
        },
      });

      if (!doctor) {
        console.log('Doctor not found:', doctorId);
        return res.status(404).json({ error: 'Doctor not found' });
      }

      // Convert JavaScript's Sunday-based day (0-6) to Monday-based day (0-6)
      const dayOfWeek = (appointmentDate.getDay() + 6) % 7;
      const timeString = appointmentDate.toTimeString().slice(0, 5); // HH:mm format

      console.log('Checking availability for:', {
        doctorId: doctor.id,
        dayOfWeek,
        timeString,
        appointmentDate: appointmentDate.toISOString(),
        appointmentLocalTime: appointmentDate.toString(),
      });

      const availability = await prisma.availability.findFirst({
        where: {
          doctorId: doctor.id,
          dayOfWeek,
          startTime: {
            lte: timeString,
          },
          endTime: {
            gte: timeString,
          },
        },
      });

      if (!availability) {
        console.log('No availability found for:', {
          doctorId: doctor.id,
          dayOfWeek,
          timeString,
        });
        return res.status(400).json({ error: 'Doctor is not available at this time' });
      }

      console.log('Found availability:', availability);

      // Check for existing appointments at the same time
      const existingAppointment = await prisma.appointment.findFirst({
        where: {
          doctorId: doctor.userId,
          dateTime: appointmentDate,
        },
      });

      if (existingAppointment) {
        console.log('Time slot already booked:', {
          existingAppointment,
          requestedTime: appointmentDate.toISOString(),
        });
        return res.status(400).json({ error: 'Time slot is already booked' });
      }

      // Create appointment with new fields
      const appointment = await prisma.appointment.create({
        data: {
          patientId: req.user!.id,
          doctorId: doctor.userId,
          dateTime: appointmentDate,
          status: 'scheduled',
          symptoms,
          consultationAnalysis,
          description,
          prescriptionFile: prescriptionFile ? Buffer.from(prescriptionFile) : null,
          prescriptionFileType: prescriptionFileType || null,
        },
        include: {
          doctor: {
            include: {
              doctorProfile: true,
            },
          },
        },
      });

      console.log('Created appointment:', appointment);

      // Format the response with new fields
      const formattedAppointment = {
        id: appointment.id.toString(),
        patientId: appointment.patientId.toString(),
        doctorId: appointment.doctorId.toString(),
        dateTime: appointment.dateTime.toISOString(),
        status: appointment.status,
        symptoms: appointment.symptoms,
        consultationAnalysis: appointment.consultationAnalysis,
        description: appointment.description,
        hasPrescription: !!appointment.prescriptionFile,
        doctor: {
          id: appointment.doctor.doctorProfile?.id.toString() || '',
          userId: appointment.doctor.id.toString(),
          name: appointment.doctor.username,
          specialty: appointment.doctor.doctorProfile?.specialty || '',
        },
      };

      return res.status(201).json(formattedAppointment);
    } catch (error) {
      console.error('Error creating appointment:', error);
      return res.status(500).json({ error: 'Failed to create appointment' });
    }
  }
);

/**
 * @swagger
 * /api/patients/appointments/{id}:
 *   delete:
 *     summary: Cancel an appointment
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     responses:
 *       204:
 *         description: Appointment cancelled successfully
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Failed to cancel appointment
 */
router.delete('/appointments/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const appointmentId = parseInt(req.params.id);

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        patientId: req.user!.id,
      },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await prisma.appointment.delete({
      where: {
        id: appointmentId,
      },
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

export default router;
