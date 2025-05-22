import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { prisma } from '../index';
import { validateRequest } from '../middleware/validate.middleware';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Use the Patient model the same way we use other models
// const patientModel = prisma.patient;

const router = Router();

// Apply authentication middleware to all patient routes
router.use(authenticateToken);

// Configure multer for memory storage for prescriptions
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

// Configure multer for profile photo uploads
const photoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/patients');

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `patient-${req.user!.id}-${uniqueSuffix}${ext}`);
  },
});

const photoUpload = multer({
  storage: photoStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed') as any);
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
      consultationAnalysis: appointment.consultationAnalysis || '',
      description: appointment.description || '',
      hasPrescription: !!appointment.prescriptionFile,
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

/**
 * @swagger
 * /api/patients/profile/{userId}:
 *   get:
 *     summary: Get patient profile by user ID
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient profile data
 *       404:
 *         description: Patient profile not found
 *       500:
 *         description: Failed to fetch patient profile
 */
router.get('/profile/:userId', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.params;
    const userIdNumber = parseInt(userId);

    // Validate userId is a number
    if (isNaN(userIdNumber)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    // First find the user
    const user = await prisma.user.findUnique({
      where: {
        id: userIdNumber,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Then find the associated patient profile
    const patientProfile = await prisma.patient.findUnique({
      where: {
        userId: userIdNumber,
      },
    });

    if (!patientProfile) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    // Format the response
    const profile = {
      id: patientProfile.id.toString(),
      userId: user.id.toString(),
      name: user.username,
      dateOfBirth: patientProfile.dateOfBirth,
      gender: patientProfile.gender,
      medicalHistory: patientProfile.medicalHistory,
      allergies: patientProfile.allergies,
      medications: patientProfile.medications,
      bloodType: patientProfile.bloodType,
      phone: patientProfile.phone,
      email: patientProfile.email,
      address: patientProfile.address,
      emergencyContact: patientProfile.emergencyContact,
      photoUrl: patientProfile.photo ? `/api/patients/profile/photo/${patientProfile.id}` : null,
    };

    return res.json(profile);
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    return res.status(500).json({ error: 'Failed to fetch patient profile' });
  }
});

/**
 * @swagger
 * /api/patients/profile:
 *   patch:
 *     summary: Update patient's profile
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dateOfBirth:
 *                 type: string
 *               gender:
 *                 type: string
 *               medicalHistory:
 *                 type: string
 *               allergies:
 *                 type: string
 *               medications:
 *                 type: string
 *               bloodType:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *               emergencyContact:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: Patient profile not found
 *       500:
 *         description: Failed to update profile
 */
router.patch('/profile', async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const {
      dateOfBirth,
      gender,
      medicalHistory,
      allergies,
      medications,
      bloodType,
      phone,
      email,
      address,
      emergencyContact,
    } = req.body;

    // Find the existing patient profile
    const patientProfile = await prisma.patient.findUnique({
      where: {
        userId: req.user!.id,
      },
    });

    if (!patientProfile) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    // Check for duplicate email
    if (email && email !== patientProfile.email) {
      const existingPatient = await prisma.patient.findFirst({
        where: {
          email,
          NOT: {
            id: patientProfile.id,
          },
        },
      });

      if (existingPatient) {
        return res.status(400).json({ error: 'Email already registered' });
      }
    }

    // Update the profile
    const updatedProfile = await prisma.patient.update({
      where: {
        userId: req.user!.id,
      },
      data: {
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
        medicalHistory: medicalHistory || undefined,
        allergies: allergies || undefined,
        medications: medications || undefined,
        bloodType: bloodType || undefined,
        phone: phone || undefined,
        email: email || undefined,
        address: address || undefined,
        emergencyContact: emergencyContact || undefined,
      },
    });

    // Add photo URL to the response
    const responseProfile = {
      ...updatedProfile,
      id: updatedProfile.id.toString(),
      userId: updatedProfile.userId.toString(),
      photoUrl: updatedProfile.photo ? `/api/patients/profile/photo/${updatedProfile.id}` : null,
    };

    return res.json(responseProfile);
  } catch (error) {
    console.error('Error updating patient profile:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * @swagger
 * /api/patients/profile/photo:
 *   post:
 *     summary: Upload patient's profile photo
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Photo uploaded successfully
 *       400:
 *         description: Invalid file or missing
 *       404:
 *         description: Patient profile not found
 *       500:
 *         description: Failed to upload photo
 */
router.post(
  '/profile/photo',
  photoUpload.single('photo'),
  async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Find the existing patient profile
      const patientProfile = await prisma.patient.findUnique({
        where: {
          userId: req.user!.id,
        },
      });

      if (!patientProfile) {
        return res.status(404).json({ error: 'Patient profile not found' });
      }

      // Remove old photo if exists
      if (patientProfile.photo) {
        const oldPhotoPath = path.join(__dirname, '../../uploads/patients', path.basename(patientProfile.photo));
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }

      // Update the profile with the new photo path
      const updatedProfile = await prisma.patient.update({
        where: {
          userId: req.user!.id,
        },
        data: {
          photo: req.file.path,
        },
      });

      // Fetch patient user data
      const patientUser = await prisma.user.findUnique({
        where: {
          id: req.user!.id,
        },
        select: {
          username: true,
        },
      });

      // Create response with photo URL
      const responseProfile = {
        id: updatedProfile.id.toString(),
        userId: updatedProfile.userId.toString(),
        name: patientUser?.username || '',
        dateOfBirth: updatedProfile.dateOfBirth,
        gender: updatedProfile.gender,
        medicalHistory: updatedProfile.medicalHistory,
        allergies: updatedProfile.allergies,
        medications: updatedProfile.medications,
        bloodType: updatedProfile.bloodType,
        phone: updatedProfile.phone,
        email: updatedProfile.email,
        address: updatedProfile.address,
        emergencyContact: updatedProfile.emergencyContact,
        photoUrl: `/api/patients/profile/photo/${updatedProfile.id}`,
      };

      return res.json(responseProfile);
    } catch (error) {
      console.error('Error uploading patient photo:', error);
      return res.status(500).json({ error: 'Failed to upload photo' });
    }
  }
);

/**
 * @swagger
 * /api/patients/profile/photo/{patientId}:
 *   get:
 *     summary: Get patient's profile photo
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Photo retrieved successfully
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Photo not found
 *       500:
 *         description: Failed to retrieve photo
 */
router.get('/profile/photo/:patientId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const patientIdNumber = parseInt(patientId);

    // Validate patientId is a number
    if (isNaN(patientIdNumber)) {
      res.status(400).json({ error: 'Invalid patient ID format' });
      return;
    }

    // Find the patient profile
    const patientProfile = await prisma.patient.findUnique({
      where: {
        id: patientIdNumber,
      },
    });

    if (!patientProfile || !patientProfile.photo) {
      res.status(404).json({ error: 'Photo not found' });
      return;
    }

    // Get the photo path
    const photoPath = patientProfile.photo;

    // Check if file exists
    if (!fs.existsSync(photoPath)) {
      res.status(404).json({ error: 'Photo file not found' });
      return;
    }

    // Determine content type
    const ext = path.extname(photoPath).toLowerCase();
    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    if (ext === '.gif') contentType = 'image/gif';
    if (ext === '.webp') contentType = 'image/webp';

    // Send the file
    res.setHeader('Content-Type', contentType);
    fs.createReadStream(photoPath).pipe(res);
  } catch (error) {
    console.error('Error retrieving patient photo:', error);
    res.status(500).json({ error: 'Failed to retrieve photo' });
  }
});

export default router;
