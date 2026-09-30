import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/Logger';

export class SecurityMiddleware {
  /**
   * Middleware to ensure API requests originate exclusively from localhost
   */
  public static restrictToLocalhost(req: Request, res: Response, next: NextFunction): void {
    const remoteAddress = req.socket.remoteAddress || '';
    const isLocalhost = 
      remoteAddress === '127.0.0.1' || 
      remoteAddress === '::1' || 
      remoteAddress === '::ffff:127.0.0.1';

    if (!isLocalhost && process.env.NODE_ENV === 'production') {
      Logger.warn('SecurityMiddleware', `Blocked external request attempt from IP: ${remoteAddress}`);
      res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Management API is restricted strictly to local system access.',
        },
      });
      return;
    }

    next();
  }

  /**
   * Sets basic HTTP security headers
   */
  public static setSecurityHeaders(req: Request, res: Response, next: NextFunction): void {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
  }
}
