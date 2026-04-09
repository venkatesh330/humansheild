import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error({ 
    error: err.message, 
    stack: err.stack,
    path: req.path,
    method: req.method
  }, 'Unhandled Error');

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    requestId: req.headers['x-request-id'] || 'system'
  });
};
