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
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: 'No token provided' });
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
