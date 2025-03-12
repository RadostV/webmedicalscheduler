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
  education?: string;
  qualification?: string;
  description?: string;
  siteUrl?: string;
  phone?: string;
  email?: string;
  location?: string;
  languages?: string;
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

      const token = jwt.sign({ userId: user.id, type: user.type }, process.env.JWT_SECRET!, { expiresIn: '24h' });

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
  body('specialty').if(body('type').equals('doctor')).optional().isString().withMessage('Specialty must be a string'),
  body('education').if(body('type').equals('doctor')).optional().isString().withMessage('Education must be a string'),
  body('qualification')
    .if(body('type').equals('doctor'))
    .optional()
    .isString()
    .withMessage('Qualification must be a string'),
  body('description')
    .if(body('type').equals('doctor'))
    .optional()
    .isString()
    .withMessage('Description must be a string'),
  body('phone').if(body('type').equals('doctor')).optional().isString().withMessage('Phone must be a string'),
  body('email').if(body('type').equals('doctor')).optional().isEmail().withMessage('Email must be valid'),
  body('location').if(body('type').equals('doctor')).optional().isString().withMessage('Location must be a string'),
  body('languages').if(body('type').equals('doctor')).optional().isString().withMessage('Languages must be a string'),
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
      const {
        username,
        password,
        type,
        specialty,
        education,
        qualification,
        description,
        siteUrl,
        phone,
        email,
        location,
        languages,
      } = req.body;

      // Check if username already exists
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Check if email exists (for doctors)
      if (type === 'doctor' && email) {
        const existingDoctor = await prisma.doctor.findFirst({
          where: { email },
        });

        if (existingDoctor) {
          return res.status(400).json({ error: 'Email already registered' });
        }
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
      if (type === 'doctor') {
        await prisma.doctor.create({
          data: {
            userId: user.id,
            specialty: specialty || '',
            education: education || '',
            qualification: qualification || '',
            description: description || '',
            siteUrl: siteUrl || '',
            phone: phone || '',
            email: email || '',
            location: location || '',
            languages: languages || '',
          },
        });
      }

      const token = jwt.sign({ userId: user.id, type: user.type }, process.env.JWT_SECRET!, { expiresIn: '24h' });

      return res.status(201).json({
        token,
        user: {
          id: user.id,
          username: user.username,
          type: user.type,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ error: 'Registration failed' });
    }
  }
);

export default router;
