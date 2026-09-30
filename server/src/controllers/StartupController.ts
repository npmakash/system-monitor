import { Request, Response, NextFunction } from 'express';
import { StartupAppService } from '../services/StartupAppService';

export class StartupController {
  constructor(private readonly startupAppService: StartupAppService) {}

  public getStartupApps = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const apps = await this.startupAppService.getStartupApps();
      res.json({ success: true, data: apps });
    } catch (error) {
      next(error);
    }
  };
}
