import { Request, Response, NextFunction } from 'express';
import { ISystemMonitor } from '../interfaces/ISystemMonitor';

export class SystemController {
  constructor(private readonly systemMonitor: ISystemMonitor) {}

  public getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = await this.systemMonitor.getSystemSummary();
      res.json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  };

  public getCpu = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cpu = await this.systemMonitor.getCpuUsage();
      res.json({ success: true, data: cpu });
    } catch (error) {
      next(error);
    }
  };

  public getMemory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const memory = await this.systemMonitor.getMemoryUsage();
      res.json({ success: true, data: memory });
    } catch (error) {
      next(error);
    }
  };

  public getDisk = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const disks = await this.systemMonitor.getDiskUsage();
      res.json({ success: true, data: disks });
    } catch (error) {
      next(error);
    }
  };

  public getNetwork = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const network = await this.systemMonitor.getNetworkUsage();
      res.json({ success: true, data: network });
    } catch (error) {
      next(error);
    }
  };

  public getInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const info = await this.systemMonitor.getSystemInformation();
      res.json({ success: true, data: info });
    } catch (error) {
      next(error);
    }
  };
}
