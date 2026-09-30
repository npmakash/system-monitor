import { IUpdateManager, UpdateInfo, UpdateResult } from '../interfaces/IUpdateManager';
import { ICommandExecutor } from '../interfaces/ICommandExecutor';
import { Logger } from '../utils/Logger';

export class AptManager implements IUpdateManager {
  public readonly managerName: 'apt' = 'apt';

  constructor(private readonly commandExecutor: ICommandExecutor) {}

  public async checkUpdates(): Promise<UpdateInfo[]> {
    try {
      // apt list --upgradable
      const res = await this.commandExecutor.execute('apt', ['list', '--upgradable']);
      if (res.exitCode !== 0 || !res.stdout) return [];

      const lines = res.stdout.trim().split('\n').slice(1);
      const updates: UpdateInfo[] = [];

      for (const line of lines) {
        // firefox/jammy-updates 120.0+build1-0ubuntu0.22.04.1 amd64 [upgradable from: 119.0]
        const match = line.match(/^([^\/]+)\/([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+\[upgradable from:\s+([^\]]+)\]/);
        if (match) {
          const name = match[1];
          const availableVersion = match[3];
          const currentVersion = match[5];
          const isSecurityUpdate = match[2].includes('security');

          updates.push({
            name,
            manager: 'apt',
            currentVersion,
            availableVersion,
            isSecurityUpdate,
            description: `APT package upgrade from ${match[2]}`,
          });
        }
      }

      return updates;
    } catch (err: any) {
      Logger.warn('AptManager', `Failed to check APT updates: ${err.message}`);
      return [];
    }
  }

  public async applyUpdate(packageName: string): Promise<UpdateResult> {
    try {
      // Controlled single package install/upgrade simulation or apt install --only-upgrade -y
      const res = await this.commandExecutor.execute('apt-get', ['install', '--only-upgrade', '-s', packageName]);
      if (res.exitCode === 0) {
        return {
          success: true,
          message: `APT package ${packageName} update check passed cleanly.`,
          packageName,
          manager: 'apt',
        };
      } else {
        return {
          success: false,
          message: `APT update failed for ${packageName}: ${res.stderr}`,
          packageName,
          manager: 'apt',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: err.message,
        packageName,
        manager: 'apt',
      };
    }
  }
}
