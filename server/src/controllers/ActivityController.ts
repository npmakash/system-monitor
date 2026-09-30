import { Request, Response, NextFunction } from 'express';
import { IActionLogService } from '../interfaces/IActionLogService';

export class ActivityController {
  constructor(private readonly actionLogService: IActionLogService) {}

  public getLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 100;
      const logs = this.actionLogService.getLogs(limit);
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  };

  public clearLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.actionLogService.clearLogs();
      res.json({ success: true, message: 'Activity log cleared.' });
    } catch (error) {
      next(error);
    }
  };
}
