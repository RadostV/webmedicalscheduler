import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { prisma } from '../index';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

interface CreateAppointmentRequest {
  doctorId: string; // This is the user ID of the doctor
  dateTime: string;
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
          include: {
            doctorProfile: true,
          },
        },
      },
      orderBy: {
        dateTime: 'asc',
      },
    });

    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Create appointment validation
const createAppointmentValidation = [
  body('doctorId').isString().withMessage('Doctor ID must be a string'),
  body('dateTime').isISO8601().withMessage('Invalid date format'),
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
  createAppointmentValidation,
  validateRequest,
  async (req: Request<{}, {}, CreateAppointmentRequest>, res: Response): Promise<Response> => {
    try {
      const { doctorId, dateTime } = req.body;
      const appointmentDate = new Date(dateTime);

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
        return res.status(404).json({ error: 'Doctor not found' });
      }

      // Check doctor's availability for the given day
      const dayOfWeek = appointmentDate.getDay();
      const timeString = appointmentDate.toTimeString().slice(0, 5); // HH:mm format

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
        return res.status(400).json({ error: 'Doctor is not available at this time' });
      }

      // Check for existing appointments at the same time
      const existingAppointment = await prisma.appointment.findFirst({
        where: {
          doctorId: doctor.userId,
          dateTime: appointmentDate,
        },
      });

      if (existingAppointment) {
        return res.status(400).json({ error: 'Time slot is already booked' });
      }

      // Create appointment
      const appointment = await prisma.appointment.create({
        data: {
          patientId: req.user!.id,
          doctorId: doctor.userId,
          dateTime: appointmentDate,
        },
        include: {
          doctor: {
            include: {
              doctorProfile: true,
            },
          },
        },
      });

      return res.status(201).json(appointment);
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