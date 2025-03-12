import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    type: string;
  };
}

interface JwtPayload {
  userId: number;
  type: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        type: string;
      };
    }
  }
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    console.log('Auth Middleware - Headers:', req.headers);
    const authHeader = req.headers['authorization'];
    console.log('Auth Middleware - Authorization Header:', authHeader);

    const token = authHeader?.split(' ')[1]; // Bearer TOKEN
    console.log('Auth Middleware - Extracted Token:', token ? token.substring(0, 20) + '...' : 'No token');

    if (!token) {
      console.log('Auth Middleware - No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }

    console.log('Auth Middleware - Verifying token:', token.substring(0, 20) + '...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    console.log('Auth Middleware - Decoded token:', decoded);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      console.log('Auth Middleware - User not found for id:', decoded.userId);
      return res.status(401).json({ error: 'User not found' });
    }

    console.log('Auth Middleware - User found:', { id: user.id, type: user.type });
    req.user = {
      id: user.id,
      type: user.type,
    };

    next();
  } catch (error) {
    console.error('Auth Middleware - Error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: 'Authentication required' });
    }

    console.log('Verifying token:', token.substring(0, 20) + '...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    console.log('Decoded token:', decoded);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      console.log('User not found for id:', decoded.userId);
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: user.id,
      type: user.type,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
