import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  console.error(err.stack);

  if (err instanceof SyntaxError) {
    return res.status(400).json({
      error: 'Invalid request syntax',
    });
  }

  // Prisma error handling
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      error: 'Database operation failed',
    });
  }

  // Default error
  return res.status(500).json({
    error: 'Internal server error',
  });
}; 