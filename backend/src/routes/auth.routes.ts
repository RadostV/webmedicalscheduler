import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  password: string;
  type: 'patient' | 'doctor';
  specialty?: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: User's username
 *         password:
 *           type: string
 *           description: User's password
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - type
 *       properties:
 *         username:
 *           type: string
 *           description: User's username
 *         password:
 *           type: string
 *           description: User's password
 *         type:
 *           type: string
 *           enum: [patient, doctor]
 *           description: Type of user account
 *         specialty:
 *           type: string
 *           description: Doctor's specialty (required if type is doctor)
 */

// Login validation
const loginValidation = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     type:
 *                       type: string
 *                     doctorProfile:
 *                       type: object
 *                       nullable: true
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Login failed
 */
router.post(
  '/login',
  loginValidation,
  validateRequest,
  async (req: Request<{}, {}, LoginRequest>, res: Response): Promise<Response> => {
    try {
      const { username, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { username },
        include: {
          doctorProfile: true,
        },
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, type: user.type },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          type: user.type,
          doctorProfile: user.doctorProfile,
        },
      });
    } catch (error) {
      return res.status(500).json({ error: 'Login failed' });
    }
  }
);

// Register validation
const registerValidation = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('type').isIn(['patient', 'doctor']).withMessage('Invalid user type'),
  body('specialty')
    .if(body('type').equals('doctor'))
    .notEmpty()
    .withMessage('Specialty is required for doctors'),
];

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     type:
 *                       type: string
 *       400:
 *         description: Username already exists or validation error
 *       500:
 *         description: Registration failed
 */
router.post(
  '/register',
  registerValidation,
  validateRequest,
  async (req: Request<{}, {}, RegisterRequest>, res: Response): Promise<Response> => {
    try {
      const { username, password, type, specialty } = req.body;

      // Check if username already exists
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          type,
        },
      });

      // If user is a doctor, create doctor profile
      if (type === 'doctor' && specialty) {
        await prisma.doctor.create({
          data: {
            userId: user.id,
            specialty,
          },
        });
      }

      const token = jwt.sign(
        { userId: user.id, type: user.type },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      return res.status(201).json({
        token,
        user: {
          id: user.id,
          username: user.username,
          type: user.type,
        },
      });
    } catch (error) {
      return res.status(500).json({ error: 'Registration failed' });
    }
  }
);

export default router; 