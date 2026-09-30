import { Request, Response, NextFunction } from 'express';
import { CleanerService } from '../services/CleanerService';

export class CleanerController {
  constructor(private readonly cleanerService: CleanerService) {}

  public scanJunk = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.cleanerService.scanJunk();
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public cleanJunk = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const targetIds = req.body && Array.isArray(req.body.targetIds) ? req.body.targetIds : [];
      const result = await this.cleanerService.cleanJunk(targetIds);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
