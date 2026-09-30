import { IUpdateManager, UpdateInfo, UpdateResult } from '../interfaces/IUpdateManager';
import { ICommandExecutor } from '../interfaces/ICommandExecutor';
import { Logger } from '../utils/Logger';

export class FlatpakManager implements IUpdateManager {
  public readonly managerName: 'flatpak' = 'flatpak';

  constructor(private readonly commandExecutor: ICommandExecutor) {}

  public async checkUpdates(): Promise<UpdateInfo[]> {
    try {
      const res = await this.commandExecutor.execute('flatpak', ['remote-ls', '--updates']);
      if (res.exitCode !== 0 || !res.stdout) {
        return [];
      }

      const lines = res.stdout.trim().split('\n');
      const updates: UpdateInfo[] = [];

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 3) {
          const name = parts[0];
          const availableVersion = parts[1] || 'Latest';
          updates.push({
            name,
            manager: 'flatpak',
            currentVersion: 'Installed',
            availableVersion,
            description: `Flatpak application update`,
          });
        }
      }

      return updates;
    } catch (err: any) {
      Logger.warn('FlatpakManager', `Flatpak check updates skipped/failed: ${err.message}`);
      return [];
    }
  }

  public async applyUpdate(packageName: string): Promise<UpdateResult> {
    try {
      const res = await this.commandExecutor.execute('flatpak', ['update', '-y', packageName]);
      if (res.exitCode === 0) {
        return {
          success: true,
          message: `Flatpak ${packageName} updated successfully.`,
          packageName,
          manager: 'flatpak',
        };
      } else {
        return {
          success: false,
          message: `Flatpak update failed for ${packageName}: ${res.stderr}`,
          packageName,
          manager: 'flatpak',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: err.message,
        packageName,
        manager: 'flatpak',
      };
    }
  }
}
