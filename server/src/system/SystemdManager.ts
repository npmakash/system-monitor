import { ICommandExecutor } from '../interfaces/ICommandExecutor';
import { ServiceInfo } from '../models/ServiceInfo';
import { Logger } from '../utils/Logger';

export class SystemdManager {
  private readonly protectedServices: Set<string> = new Set([
    'dbus.service',
    'systemd-journald.service',
    'systemd-logind.service',
    'systemd-resolved.service',
    'polkit.service',
    'gdm.service',
  ]);

  constructor(private readonly commandExecutor: ICommandExecutor) {}

  public async getServices(): Promise<ServiceInfo[]> {
    try {
      // systemctl list-units --type=service --all --no-legend --no-pager
      const res = await this.commandExecutor.execute('systemctl', [
        'list-units',
        '--type=service',
        '--all',
        '--no-legend',
        '--no-pager',
      ]);

      if (res.exitCode !== 0 || !res.stdout) {
        return [];
      }

      const lines = res.stdout.trim().split('\n');
      const services: ServiceInfo[] = [];

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 4) {
          const name = parts[0];
          const loadState = parts[1];
          const activeState = parts[2];
          const subState = parts[3];
          const description = parts.slice(4).join(' ');

          const isProtected = this.protectedServices.has(name);

          services.push({
            name,
            description,
            loadState,
            activeState,
            subState,
            unitFileState: activeState === 'active' ? 'enabled' : 'disabled',
            isProtected,
          });
        }
      }

      return services;
    } catch (err: any) {
      Logger.warn('SystemdManager', `Failed to list systemd services: ${err.message}`);
      return [];
    }
  }

  public isProtectedService(serviceName: string): boolean {
    return this.protectedServices.has(serviceName) || this.protectedServices.has(`${serviceName}.service`);
  }
}
