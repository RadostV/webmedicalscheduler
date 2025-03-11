import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { prisma } from '../index';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

interface SetAvailabilityRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface AppointmentWithDateTime {
  dateTime: Date;
}

// Set availability validation
const setAvailabilityValidation = [
  body('dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('Day of week must be between 0 and 6'),
  body('startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Start time must be in HH:mm format'),
  body('endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('End time must be in HH:mm format'),
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
 *           description: Day of week (0 = Sunday, 6 = Saturday)
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
        patient: true,
      },
      orderBy: {
        dateTime: 'asc',
      },
    });

    const bookedAppointments = appointments.map((apt: AppointmentWithDateTime) => ({
      ...apt,
      dateTime: apt.dateTime.toISOString(),
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
    const dayOfWeek = date.getDay();

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

    const bookedTimes = new Set(
      bookedAppointments.map((apt: AppointmentWithDateTime) => apt.dateTime.toTimeString().slice(0, 5))
    );

    const availableSlots = slots.filter((slot) => !bookedTimes.has(slot));

    return res.json(availableSlots);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch available slots' });
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

export default router; 