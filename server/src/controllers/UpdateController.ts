import { Request, Response, NextFunction } from 'express';
import { UpdateService } from '../services/UpdateService';
import { UpdatePolicyService } from '../services/UpdatePolicyService';

export class UpdateController {
  constructor(
    private readonly updateService: UpdateService,
    private readonly policyService: UpdatePolicyService
  ) {}

  public getAllUpdates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = await this.updateService.checkAllUpdates();
      res.json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  };

  public getAptUpdates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updates = await this.updateService.checkUpdatesByManager('apt');
      res.json({ success: true, data: updates });
    } catch (error) {
      next(error);
    }
  };

  public getSnapUpdates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updates = await this.updateService.checkUpdatesByManager('snap');
      res.json({ success: true, data: updates });
    } catch (error) {
      next(error);
    }
  };

  public getFlatpakUpdates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updates = await this.updateService.checkUpdatesByManager('flatpak');
      res.json({ success: true, data: updates });
    } catch (error) {
      next(error);
    }
  };

  public approveUpdate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { manager, package: pkgName } = req.params;
      const { userConfirmed = false } = req.body || {};

      const validManagers = ['apt', 'snap', 'flatpak'];
      if (!validManagers.includes(manager)) {
        res.status(400).json({ success: false, error: { code: 'INVALID_MANAGER', message: `Invalid manager '${manager}'.` } });
        return;
      }

      const result = await this.updateService.approveAndUpdate(manager as any, pkgName, userConfirmed);
      if (result.success) {
        res.json({ success: true, data: result });
      } else {
        res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: result.message }, data: result });
      }
    } catch (error) {
      next(error);
    }
  };

  public getPolicySettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({ success: true, data: this.policyService.getSettings() });
    } catch (error) {
      next(error);
    }
  };

  public updatePolicySettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = this.policyService.updateSettings(req.body || {});
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };
}
