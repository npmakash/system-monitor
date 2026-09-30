import { SystemdManager } from '../system/SystemdManager';
import { ICommandExecutor } from '../interfaces/ICommandExecutor';
import { ActionLogService } from './ActionLogService';
import { ServiceInfo } from '../models/ServiceInfo';
import { Logger } from '../utils/Logger';

export interface ServiceActionResult {
  success: boolean;
  message: string;
  serviceName: string;
  action: 'start' | 'stop' | 'restart';
}

export class ServiceManager {
  constructor(
    private readonly systemdManager: SystemdManager,
    private readonly commandExecutor: ICommandExecutor,
    private readonly actionLogService: ActionLogService
  ) {}

  public async getServices(): Promise<ServiceInfo[]> {
    return await this.systemdManager.getServices();
  }

  public async controlService(serviceName: string, action: 'start' | 'stop' | 'restart', userConfirmed: boolean = false): Promise<ServiceActionResult> {
    const cleanName = serviceName.endsWith('.service') ? serviceName : `${serviceName}.service`;

    if (this.systemdManager.isProtectedService(cleanName)) {
      const msg = `Action denied: '${cleanName}' is a protected core systemd service.`;
      this.actionLogService.logAction({
        action: `${action.toUpperCase()} Service`,
        target: cleanName,
        result: 'BLOCKED',
        userConfirmation: userConfirmed,
        details: msg,
      });
      return { success: false, message: msg, serviceName: cleanName, action };
    }

    if (!userConfirmed && (action === 'stop' || action === 'restart')) {
      const msg = `Explicit user confirmation required to ${action} service '${cleanName}'.`;
      this.actionLogService.logAction({
        action: `${action.toUpperCase()} Service`,
        target: cleanName,
        result: 'BLOCKED',
        userConfirmation: false,
        details: msg,
      });
      return { success: false, message: msg, serviceName: cleanName, action };
    }

    Logger.info('ServiceManager', `Executing systemctl ${action} for ${cleanName}`);
    const res = await this.commandExecutor.execute('systemctl', [action, cleanName]);

    if (res.exitCode === 0) {
      const msg = `Successfully executed systemctl ${action} on ${cleanName}.`;
      this.actionLogService.logAction({
        action: `${action.toUpperCase()} Service`,
        target: cleanName,
        result: 'SUCCESS',
        userConfirmation: userConfirmed,
        details: msg,
      });
      return { success: true, message: msg, serviceName: cleanName, action };
    } else {
      const msg = `Failed to ${action} service ${cleanName}: ${res.stderr}`;
      this.actionLogService.logAction({
        action: `${action.toUpperCase()} Service`,
        target: cleanName,
        result: 'FAILED',
        userConfirmation: userConfirmed,
        details: msg,
      });
      return { success: false, message: msg, serviceName: cleanName, action };
    }
  }
}
