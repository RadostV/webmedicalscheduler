import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { prisma } from '../index';
import { validateRequest } from '../middleware/validate.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import multer from 'multer';
import sharp from 'sharp';
import jwt from 'jsonwebtoken';

interface AuthUser {
  id: number;
  type: string;
  doctorId?: number;
}

interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

interface MulterAuthRequest extends AuthenticatedRequest {
  file?: Express.Multer.File;
}

// Create a separate router for public routes
const publicRouter = Router();

// Create the main router for authenticated routes
const router = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Configure multer for prescription file uploads
const prescriptionStorage = multer.memoryStorage();
const uploadPrescription = multer({
  storage: prescriptionStorage,
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

// Add the photo route to the public router
publicRouter.get('/profile/photo/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const doctorId = parseInt(req.params.id);

    if (isNaN(doctorId)) {
      console.error('Invalid doctor ID:', req.params.id);
      return res.status(400).json({ message: 'Invalid doctor ID' });
    }

    console.log('Fetching photo for doctor ID:', doctorId);

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: {
        photo: true,
        photoType: true,
      },
    });

    if (!doctor || !doctor.photo || !doctor.photoType) {
      console.error('Photo not found for doctor ID:', doctorId);
      return res.status(404).json({ message: 'Photo not found' });
    }

    console.log('Found photo with type:', doctor.photoType);

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('Content-Type', doctor.photoType);
    res.setHeader('Content-Length', doctor.photo.length);

    return res.send(doctor.photo);
  } catch (error) {
    console.error('Error retrieving photo:', error);
    return res.status(500).json({ message: 'Failed to retrieve photo' });
  }
});

// Apply authentication middleware to the main router
router.use(authenticateToken);

interface SetAvailabilityRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface AppointmentWithDateTime {
  dateTime: Date;
  patient: {
    username: string;
  };
}

// Set availability validation
const setAvailabilityValidation = [
  body('dayOfWeek')
    .isInt({ min: 0, max: 6 })
    .withMessage('Day of week must be between 0 and 6 (Monday = 0, Sunday = 6)'),
  body('startTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Start time must be in HH:mm format'),
  body('endTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('End time must be in HH:mm format'),
];

/**
 * @swagger
 * components:
 *   schemas:
 *     SetAvailabilityRequest:
 *       type: object
 *       required:
 *         - dayOfWeek
 *         - startTime
 *         - endTime
 *       properties:
 *         dayOfWeek:
 *           type: integer
 *           minimum: 0
 *           maximum: 6
 *           description: Day of week (0 = Monday, 6 = Sunday)
 *         startTime:
 *           type: string
 *           pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *           description: Start time in HH:mm format
 *         endTime:
 *           type: string
 *           pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *           description: End time in HH:mm format
 */

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: Get all doctors
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of doctors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   userId:
 *                     type: integer
 *                   specialty:
 *                     type: string
 *                   name:
 *                     type: string
 *       500:
 *         description: Failed to fetch doctors
 */
router.get('/', async (_req: Request, res: Response): Promise<Response> => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    // Transform the response to include all profile fields
    const formattedDoctors = doctors.map((doctor) => ({
      id: doctor.id.toString(),
      userId: doctor.userId.toString(),
      name: doctor.user.username,
      specialty: doctor.specialty,
      education: doctor.education,
      qualification: doctor.qualification,
      description: doctor.description,
      siteUrl: doctor.siteUrl,
      phone: doctor.phone,
      email: doctor.email,
      location: doctor.location,
      languages: doctor.languages,
      photoUrl: doctor.photo ? `/api/doctors/profile/photo/${doctor.id}` : null,
    }));

    return res.json(formattedDoctors);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

/**
 * @swagger
 * /api/doctors/appointments:
 *   get:
 *     summary: Get doctor's appointments
 *     tags: [Doctors]
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
 *                   patient:
 *                     type: object
 *       500:
 *         description: Failed to fetch appointments
 */
router.get('/appointments', async (req: Request, res: Response): Promise<Response> => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: req.user!.id,
      },
      include: {
        patient: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        dateTime: 'asc',
      },
    });

    const bookedAppointments = appointments.map((apt: AppointmentWithDateTime) => ({
      ...apt,
      dateTime: apt.dateTime.toISOString(),
      patientName: apt.patient.username,
    }));

    return res.json(bookedAppointments);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

/**
 * @swagger
 * /api/doctors/availability:
 *   get:
 *     summary: Get doctor's availability
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of availability slots
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   dayOfWeek:
 *                     type: integer
 *                   startTime:
 *                     type: string
 *                   endTime:
 *                     type: string
 *       500:
 *         description: Failed to fetch availability
 */
router.get('/availability', async (req: Request, res: Response): Promise<Response> => {
  try {
    const availability = await prisma.availability.findMany({
      where: {
        doctor: {
          userId: req.user!.id,
        },
      },
      orderBy: {
        dayOfWeek: 'asc',
      },
    });

    return res.json(availability);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

/**
 * @swagger
 * /api/doctors/availability:
 *   post:
 *     summary: Set doctor's availability
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SetAvailabilityRequest'
 *     responses:
 *       200:
 *         description: Availability set successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 dayOfWeek:
 *                   type: integer
 *                 startTime:
 *                   type: string
 *                 endTime:
 *                   type: string
 *       404:
 *         description: Doctor profile not found
 *       500:
 *         description: Failed to set availability
 */
router.post(
  '/availability',
  setAvailabilityValidation,
  validateRequest,
  async (req: Request<{}, {}, SetAvailabilityRequest>, res: Response): Promise<Response> => {
    try {
      const { dayOfWeek, startTime, endTime } = req.body;

      // Get doctor profile
      const doctorProfile = await prisma.user.findUnique({
        where: {
          id: req.user!.id,
        },
        include: {
          doctorProfile: true,
        },
      });

      if (!doctorProfile?.doctorProfile) {
        return res.status(404).json({ error: 'Doctor profile not found' });
      }

      // Check for existing availability
      const existingAvailability = await prisma.availability.findFirst({
        where: {
          doctorId: doctorProfile.doctorProfile.id,
          dayOfWeek,
        },
      });

      if (existingAvailability) {
        // Update existing availability
        const availability = await prisma.availability.update({
          where: {
            id: existingAvailability.id,
          },
          data: {
            startTime,
            endTime,
          },
        });

        return res.json(availability);
      } else {
        // Create new availability
        const availability = await prisma.availability.create({
          data: {
            doctorId: doctorProfile.doctorProfile.id,
            dayOfWeek,
            startTime,
            endTime,
          },
        });

        return res.json(availability);
      }
    } catch (error) {
      return res.status(500).json({ error: 'Failed to set availability' });
    }
  }
);

/**
 * @swagger
 * /api/doctors/availability/{id}:
 *   delete:
 *     summary: Delete doctor's availability
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Availability ID
 *     responses:
 *       204:
 *         description: Availability deleted successfully
 *       404:
 *         description: Availability not found
 *       500:
 *         description: Failed to delete availability
 */
router.delete('/availability/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const availabilityId = parseInt(req.params.id);

    const doctorProfile = await prisma.doctor.findUnique({
      where: {
        userId: req.user!.id,
      },
    });

    if (!doctorProfile) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    const availability = await prisma.availability.findFirst({
      where: {
        id: availabilityId,
        doctorId: doctorProfile.id,
      },
    });

    if (!availability) {
      return res.status(404).json({ error: 'Availability not found' });
    }

    await prisma.availability.delete({
      where: {
        id: availabilityId,
      },
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete availability' });
  }
});

/**
 * @swagger
 * /api/doctors/slots:
 *   get:
 *     summary: Get available time slots for a specific date
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to check availability (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of available time slots
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *       400:
 *         description: Date parameter is required
 *       404:
 *         description: No availability found for this day
 *       500:
 *         description: Failed to fetch available slots
 */
router.get('/slots', async (req: Request, res: Response): Promise<Response> => {
  try {
    const dateStr = req.query.date as string;
    if (!dateStr) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    const date = new Date(dateStr);
    // Convert JavaScript's Sunday-based day (0-6) to Monday-based day (0-6)
    // JavaScript: Sunday=0, Monday=1, ..., Saturday=6
    // Our system: Monday=0, Tuesday=1, ..., Sunday=6
    const dayOfWeek = date.getDay() === 0 ? 6 : date.getDay() - 1;

    const doctorProfile = await prisma.doctor.findUnique({
      where: {
        userId: req.user!.id,
      },
      include: {
        availability: {
          where: {
            dayOfWeek,
          },
        },
      },
    });

    if (!doctorProfile || !doctorProfile.availability.length) {
      return res.status(404).json({ error: 'No availability found for this day' });
    }

    const availability = doctorProfile.availability[0];
    const slots = generateTimeSlots(date, availability.startTime, availability.endTime);

    // Filter out slots that are already booked
    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: req.user!.id,
        dateTime: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(24, 0, 0, 0)),
        },
      },
    });

    const bookedTimes = new Set(bookedAppointments.map((apt) => apt.dateTime.toTimeString().slice(0, 5)));

    const availableSlots = slots.filter((slot) => !bookedTimes.has(slot));

    return res.json(availableSlots);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch available slots' });
  }
});

/**
 * @swagger
 * /api/doctors/{id}/slots:
 *   get:
 *     summary: Get available time slots for a specific doctor on a specific date
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to check availability (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of available time slots
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *       400:
 *         description: Date parameter is required
 *       404:
 *         description: No availability found for this day
 *       500:
 *         description: Failed to fetch available slots
 */
router.get('/:id/slots', async (req: Request, res: Response): Promise<Response> => {
  try {
    const dateStr = req.query.date as string;
    if (!dateStr) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    const date = new Date(dateStr);
    // Convert JavaScript's Sunday-based day (0-6) to Monday-based day (0-6)
    // JavaScript: Sunday=0, Monday=1, ..., Saturday=6
    // Our system: Monday=0, Tuesday=1, ..., Sunday=6
    const dayOfWeek = date.getDay() === 0 ? 6 : date.getDay() - 1;

    const doctorProfile = await findDoctorByEitherIdType(req.params.id, dayOfWeek);

    if (!doctorProfile || !doctorProfile.availability.length) {
      return res.status(404).json({ error: 'No availability found for this day' });
    }

    const availability = doctorProfile.availability[0];
    const slots = generateTimeSlots(date, availability.startTime, availability.endTime);

    // Filter out slots that are already booked
    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorProfile.userId,
        dateTime: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(24, 0, 0, 0)),
        },
      },
    });

    const bookedTimes = new Set(bookedAppointments.map((apt) => apt.dateTime.toTimeString().slice(0, 5)));

    const availableSlots = slots.filter((slot) => !bookedTimes.has(slot));

    return res.json(availableSlots);
  } catch (error) {
    console.error('Error fetching slots:', error);
    return res.status(500).json({ error: 'Failed to fetch available slots' });
  }
});

/**
 * @swagger
 * /api/doctors/appointments/{id}/status:
 *   patch:
 *     summary: Update appointment status
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [completed, cancelled]
 *     responses:
 *       200:
 *         description: Appointment status updated successfully
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Failed to update appointment status
 */
router.patch('/appointments/:id/status', async (req: Request, res: Response): Promise<Response> => {
  try {
    const appointmentId = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(appointmentId)) {
      return res.status(400).json({ error: 'Invalid appointment ID' });
    }

    if (!['completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if appointment exists and belongs to the doctor
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        doctorId: req.user!.id,
      },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Update appointment status
    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        status,
      },
      include: {
        patient: {
          select: {
            username: true,
          },
        },
      },
    });

    // Format the response
    const formattedAppointment = {
      ...updatedAppointment,
      patientName: updatedAppointment.patient.username,
    };

    return res.status(200).json(formattedAppointment);
  } catch (error) {
    console.error('Error updating appointment status:', error);
    return res.status(500).json({ error: 'Failed to update appointment status' });
  }
});

/**
 * @swagger
 * /api/doctors/appointments/{id}:
 *   delete:
 *     summary: Delete an appointment
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment deleted successfully
 *       404:
 *         description: Appointment not found
 *       403:
 *         description: Not authorized to delete this appointment
 *       500:
 *         description: Failed to delete appointment
 */
router.delete('/appointments/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const appointmentId = parseInt(req.params.id);

    // Check if the appointment exists and belongs to this doctor
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        doctorId: req.user!.id,
      },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found or not authorized to delete' });
    }

    // Delete the appointment
    await prisma.appointment.delete({
      where: {
        id: appointmentId,
      },
    });

    return res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

/**
 * @swagger
 * /api/doctors/profile:
 *   patch:
 *     summary: Update doctor's profile
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               specialty:
 *                 type: string
 *               education:
 *                 type: string
 *               qualification:
 *                 type: string
 *               description:
 *                 type: string
 *               siteUrl:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               location:
 *                 type: string
 *               languages:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: Doctor profile not found
 *       500:
 *         description: Failed to update profile
 */
router.patch('/profile', async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { specialty, education, qualification, description, siteUrl, phone, email, location, languages } = req.body;

    const doctorProfile = await prisma.doctor.findUnique({
      where: {
        userId: req.user!.id,
      },
    });

    if (!doctorProfile) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    if (email && email !== doctorProfile.email) {
      const existingDoctor = await prisma.doctor.findFirst({
        where: {
          email,
          NOT: {
            id: doctorProfile.id,
          },
        },
      });

      if (existingDoctor) {
        return res.status(400).json({ error: 'Email already registered' });
      }
    }

    const updatedProfile = await prisma.doctor.update({
      where: {
        userId: req.user!.id,
      },
      data: {
        specialty: specialty || undefined,
        education: education || undefined,
        qualification: qualification || undefined,
        description: description || undefined,
        siteUrl: siteUrl || undefined,
        phone: phone || undefined,
        email: email || undefined,
        location: location || undefined,
        languages: languages || undefined,
      },
    });

    // Add photo URL to the response
    const responseProfile = {
      ...updatedProfile,
      photoUrl: updatedProfile.photo ? `/api/doctors/profile/photo/${updatedProfile.id}` : null,
    };

    return res.json(responseProfile);
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * @swagger
 * /api/doctors/profile/photo:
 *   post:
 *     summary: Upload a profile photo
 *     tags: [Doctors]
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
 *         description: No file uploaded or invalid file type
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/profile/photo',
  upload.single('photo'),
  async (req: MulterAuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Find the doctor profile using the user ID from the token
      const doctorProfile = await prisma.doctor.findUnique({
        where: { userId: req.user!.id },
      });

      if (!doctorProfile) {
        return res.status(401).json({ message: 'Doctor profile not found' });
      }

      // Compress and resize the image
      const processedImage = await sharp(req.file.buffer)
        .resize(300, 300, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      const updatedDoctor = await prisma.doctor.update({
        where: { id: doctorProfile.id },
        data: {
          photo: processedImage,
          photoType: 'image/jpeg', // We're converting all images to JPEG
        },
        select: {
          id: true,
          photoType: true,
        },
      });

      return res.json({
        message: 'Photo uploaded successfully',
        doctor: {
          id: updatedDoctor.id,
          photoUrl: `/api/doctors/profile/photo/${updatedDoctor.id}`,
          photoType: updatedDoctor.photoType,
        },
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      return res.status(500).json({ message: 'Failed to upload photo' });
    }
  }
);

/**
 * @swagger
 * /api/doctors/test-auth:
 *   get:
 *     summary: Test authentication
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authentication successful
 *       401:
 *         description: Authentication failed
 */
router.get('/test-auth', async (req: AuthenticatedRequest, res: Response) => {
  return res.json({
    message: 'Authentication successful',
    user: {
      id: req.user?.id,
      type: req.user?.type,
    },
  });
});

/**
 * @swagger
 * /api/doctors/profile:
 *   get:
 *     summary: Get doctor's profile
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor profile retrieved successfully
 *       404:
 *         description: Doctor profile not found
 *       500:
 *         description: Failed to fetch profile
 */
router.get('/profile', async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    console.log('Fetching doctor profile for user:', req.user);

    const doctorProfile = await prisma.doctor.findUnique({
      where: {
        userId: req.user!.id,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!doctorProfile) {
      console.log('Doctor profile not found for user:', req.user);
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    console.log('Found doctor profile:', doctorProfile);

    // Add photo URL and format the response
    const responseProfile = {
      id: doctorProfile.id.toString(),
      userId: doctorProfile.userId.toString(),
      specialty: doctorProfile.specialty,
      education: doctorProfile.education,
      qualification: doctorProfile.qualification,
      description: doctorProfile.description,
      siteUrl: doctorProfile.siteUrl,
      phone: doctorProfile.phone,
      email: doctorProfile.email,
      location: doctorProfile.location,
      languages: doctorProfile.languages,
      photoUrl: doctorProfile.photo ? `/api/doctors/profile/photo/${doctorProfile.id}` : null,
      username: doctorProfile.user.username,
    };

    return res.json(responseProfile);
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * @swagger
 * /api/doctors/appointments/{id}/complete:
 *   patch:
 *     summary: Complete an appointment with medical details
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - consultationAnalysis
 *               - description
 *             properties:
 *               consultationAnalysis:
 *                 type: string
 *               description:
 *                 type: string
 *               prescriptionFile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Appointment completed successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Failed to complete appointment
 */
router.patch(
  '/appointments/:id/complete',
  uploadPrescription.single('prescriptionFile'),
  [
    body('consultationAnalysis').notEmpty().withMessage('Consultation analysis is required'),
    body('description').notEmpty().withMessage('Description is required'),
  ],
  validateRequest,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const appointmentId = parseInt(req.params.id);
      const { consultationAnalysis, description } = req.body;
      const prescriptionFile = req.file?.buffer;
      const prescriptionFileType = req.file?.mimetype;

      if (isNaN(appointmentId)) {
        return res.status(400).json({ error: 'Invalid appointment ID' });
      }

      // Check if appointment exists and belongs to the doctor
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          doctorId: req.user!.id,
        },
      });

      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      // Update appointment with medical details and mark as completed
      const updatedAppointment = await prisma.appointment.update({
        where: {
          id: appointmentId,
        },
        data: {
          status: 'completed',
          consultationAnalysis,
          description,
          prescriptionFile: prescriptionFile ? Buffer.from(prescriptionFile) : undefined,
          prescriptionFileType: prescriptionFileType || undefined,
        },
        include: {
          patient: {
            select: {
              username: true,
            },
          },
        },
      });

      // Format the response
      const formattedAppointment = {
        ...updatedAppointment,
        patientName: updatedAppointment.patient.username,
        hasPrescription: !!updatedAppointment.prescriptionFile,
      };

      return res.status(200).json(formattedAppointment);
    } catch (error) {
      console.error('Error completing appointment:', error);
      return res.status(500).json({ error: 'Failed to complete appointment' });
    }
  }
);

// Add the prescription file route to the public router
publicRouter.get('/appointments/:id/prescription', async (req: Request, res: Response): Promise<Response> => {
  try {
    const appointmentId = parseInt(req.params.id);
    const token = req.query.token as string;

    if (!token) {
      return res.status(401).json({ message: 'Authentication token is required' });
    }

    if (isNaN(appointmentId)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }

    // Verify the token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };

      // Get the appointment
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          OR: [{ patientId: decoded.userId }, { doctorId: decoded.userId }],
        },
        select: {
          prescriptionFile: true,
          prescriptionFileType: true,
        },
      });

      if (!appointment) {
        console.log('Auth failed or appointment not found:', {
          userId: decoded.userId,
          appointmentId,
        });
        return res.status(403).json({ message: 'Not authorized to access this prescription' });
      }

      if (!appointment.prescriptionFile || !appointment.prescriptionFileType) {
        return res.status(404).json({ message: 'Prescription not found' });
      }

      // Set headers
      res.setHeader('Content-Type', appointment.prescriptionFileType);
      res.setHeader('Content-Disposition', 'inline; filename="prescription.pdf"');
      res.setHeader('Content-Length', appointment.prescriptionFile.length);

      return res.send(appointment.prescriptionFile);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Error retrieving prescription:', error);
    return res.status(500).json({ message: 'Failed to retrieve prescription' });
  }
});

/**
 * @swagger
 * /api/doctors/{id}:
 *   get:
 *     summary: Get a specific doctor by ID
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor profile retrieved successfully
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Failed to fetch doctor
 */
router.get('/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const doctorId = parseInt(req.params.id);

    if (isNaN(doctorId)) {
      return res.status(400).json({ error: 'Invalid doctor ID format' });
    }

    const doctor = await prisma.doctor.findUnique({
      where: {
        id: doctorId,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Format the response
    const formattedDoctor = {
      id: doctor.id.toString(),
      userId: doctor.userId.toString(),
      name: doctor.user.username,
      specialty: doctor.specialty,
      education: doctor.education,
      qualification: doctor.qualification,
      description: doctor.description,
      siteUrl: doctor.siteUrl,
      phone: doctor.phone,
      email: doctor.email,
      location: doctor.location,
      languages: doctor.languages,
      photoUrl: doctor.photo ? `/api/doctors/profile/photo/${doctor.id}` : null,
    };

    return res.json(formattedDoctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    return res.status(500).json({ error: 'Failed to fetch doctor' });
  }
});

// Helper function to generate time slots
function generateTimeSlots(date: Date, startTime: string, endTime: string): string[] {
  const slots: string[] = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  let currentTime = new Date(date);
  currentTime.setHours(startHour, startMinute, 0);

  const endDateTime = new Date(date);
  endDateTime.setHours(endHour, endMinute, 0);

  while (currentTime < endDateTime) {
    slots.push(currentTime.toTimeString().slice(0, 5));
    currentTime.setMinutes(currentTime.getMinutes() + 30); // 30-minute slots
  }

  return slots;
}

// Helper function to find doctor by either doctorId or userId
async function findDoctorByEitherIdType(id: string, dayOfWeek: number) {
  // First try to find by doctor.id (profile ID)
  let doctor = await prisma.doctor.findFirst({
    where: {
      id: parseInt(id),
    },
    include: {
      availability: {
        where: {
          dayOfWeek,
        },
      },
    },
  });

  // If not found, try by user.id (userId)
  if (!doctor) {
    doctor = await prisma.doctor.findFirst({
      where: {
        userId: parseInt(id),
      },
      include: {
        availability: {
          where: {
            dayOfWeek,
          },
        },
      },
    });
  }

  return doctor;
}

// Export both routers
export { publicRouter, router as default };
