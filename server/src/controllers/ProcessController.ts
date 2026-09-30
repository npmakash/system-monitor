import { Request, Response, NextFunction } from 'express';
import { IProcessManager } from '../interfaces/IProcessManager';

export class ProcessController {
  constructor(private readonly processManager: IProcessManager) {}

  public getProcesses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = await this.processManager.getProcesses();
      res.json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  };

  public getProcessByPid = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pid = parseInt(req.params.pid, 10);
      if (isNaN(pid)) {
        res.status(400).json({ success: false, error: { code: 'INVALID_PID', message: 'Invalid Process ID provided.' } });
        return;
      }

      const proc = await this.processManager.getProcessByPid(pid);
      if (!proc) {
        res.status(404).json({ success: false, error: { code: 'PROCESS_NOT_FOUND', message: `Process PID ${pid} not found.` } });
        return;
      }

      res.json({ success: true, data: proc });
    } catch (error) {
      next(error);
    }
  };

  public stopProcess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pid = parseInt(req.params.pid, 10);
      const { signal = 'SIGTERM', userConfirmed = false } = req.body || {};

      if (isNaN(pid)) {
        res.status(400).json({ success: false, error: { code: 'INVALID_PID', message: 'Invalid Process ID provided.' } });
        return;
      }

      if (!userConfirmed) {
        res.status(400).json({
          success: false,
          error: {
            code: 'CONFIRMATION_REQUIRED',
            message: 'Explicit user confirmation is required to terminate system processes.',
          },
        });
        return;
      }

      const result = await this.processManager.stopProcess(pid, signal);
      if (result.success) {
        res.json({ success: true, message: result.message, data: result });
      } else {
        res.status(400).json({ success: false, error: { code: 'ACTION_DENIED', message: result.message }, data: result });
      }
    } catch (error) {
      next(error);
    }
  };

  public restartProcess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pid = parseInt(req.params.pid, 10);
      const { userConfirmed = false } = req.body || {};

      if (isNaN(pid)) {
        res.status(400).json({ success: false, error: { code: 'INVALID_PID', message: 'Invalid Process ID provided.' } });
        return;
      }

      if (!userConfirmed) {
        res.status(400).json({
          success: false,
          error: {
            code: 'CONFIRMATION_REQUIRED',
            message: 'Explicit user confirmation is required to restart system processes.',
          },
        });
        return;
      }

      const result = await this.processManager.restartProcess(pid);
      if (result.success) {
        res.json({ success: true, message: result.message, data: result });
      } else {
        res.status(400).json({ success: false, error: { code: 'ACTION_DENIED', message: result.message }, data: result });
      }
    } catch (error) {
      next(error);
    }
  };
}
