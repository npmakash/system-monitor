import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/Logger';

export class ErrorHandler {
  public static handle(err: any, req: Request, res: Response, next: NextFunction): void {
    Logger.error('ErrorHandler', `Unhandled error during request [${req.method} ${req.path}]: ${err.message}`, err.stack);

    const statusCode = err.statusCode || 500;
    const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
    const message = err.isPublic ? err.message : 'An unexpected error occurred while processing system metrics.';

    res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message: message,
      },
    });
  }
}
