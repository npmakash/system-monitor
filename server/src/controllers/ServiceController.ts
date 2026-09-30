import { Request, Response, NextFunction } from 'express';
import { ServiceManager } from '../services/ServiceManager';

export class ServiceController {
  constructor(private readonly serviceManager: ServiceManager) {}

  public getServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const services = await this.serviceManager.getServices();
      res.json({ success: true, data: services });
    } catch (error) {
      next(error);
    }
  };

  public startService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name } = req.params;
      const { userConfirmed = false } = req.body || {};
      const result = await this.serviceManager.controlService(name, 'start', userConfirmed);
      if (result.success) {
        res.json({ success: true, message: result.message, data: result });
      } else {
        res.status(400).json({ success: false, error: { code: 'SERVICE_ACTION_FAILED', message: result.message }, data: result });
      }
    } catch (error) {
      next(error);
    }
  };

  public stopService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name } = req.params;
      const { userConfirmed = false } = req.body || {};
      const result = await this.serviceManager.controlService(name, 'stop', userConfirmed);
      if (result.success) {
        res.json({ success: true, message: result.message, data: result });
      } else {
        res.status(400).json({ success: false, error: { code: 'SERVICE_ACTION_FAILED', message: result.message }, data: result });
      }
    } catch (error) {
      next(error);
    }
  };

  public restartService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name } = req.params;
      const { userConfirmed = false } = req.body || {};
      const result = await this.serviceManager.controlService(name, 'restart', userConfirmed);
      if (result.success) {
        res.json({ success: true, message: result.message, data: result });
      } else {
        res.status(400).json({ success: false, error: { code: 'SERVICE_ACTION_FAILED', message: result.message }, data: result });
      }
    } catch (error) {
      next(error);
    }
  };
}
