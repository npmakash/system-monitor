import { ActionLogItem, IActionLogService } from '../interfaces/IActionLogService';
import { Logger } from '../utils/Logger';

export class ActionLogService implements IActionLogService {
  private logs: ActionLogItem[] = [];
  private readonly maxLogs: number = 500;

  public logAction(item: Omit<ActionLogItem, 'id' | 'timestamp'>): ActionLogItem {
    const newLog: ActionLogItem = {
      ...item,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
    };

    this.logs.unshift(newLog); // prepend newest logs

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    Logger.info('ActionLogService', `Logged Action [${newLog.result}]: ${newLog.action} on ${newLog.target}`);
    return newLog;
  }

  public getLogs(limit: number = 100): ActionLogItem[] {
    return this.logs.slice(0, Math.max(1, limit));
  }

  public clearLogs(): void {
    this.logs = [];
  }
}
