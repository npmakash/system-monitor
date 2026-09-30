import { IUpdateManager, UpdateInfo, UpdateResult } from '../interfaces/IUpdateManager';
import { ICommandExecutor } from '../interfaces/ICommandExecutor';
import { Logger } from '../utils/Logger';

export class SnapManager implements IUpdateManager {
  public readonly managerName: 'snap' = 'snap';

  constructor(private readonly commandExecutor: ICommandExecutor) {}

  public async checkUpdates(): Promise<UpdateInfo[]> {
    try {
      // snap refresh --list
      const res = await this.commandExecutor.execute('snap', ['refresh', '--list']);
      if (res.exitCode !== 0 || !res.stdout || res.stdout.includes('All snaps up to date')) {
        return [];
      }

      const lines = res.stdout.trim().split('\n').slice(1);
      const updates: UpdateInfo[] = [];

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 4) {
          const name = parts[0];
          const availableVersion = parts[1];
          const currentVersion = parts[2] || 'Installed';
          const publisher = parts[3];

          updates.push({
            name,
            manager: 'snap',
            currentVersion,
            availableVersion,
            description: `Snap package published by ${publisher}`,
          });
        }
      }

      return updates;
    } catch (err: any) {
      Logger.warn('SnapManager', `Failed to check Snap updates: ${err.message}`);
      return [];
    }
  }

  public async applyUpdate(packageName: string): Promise<UpdateResult> {
    try {
      const res = await this.commandExecutor.execute('snap', ['refresh', packageName]);
      if (res.exitCode === 0) {
        return {
          success: true,
          message: `Snap ${packageName} refreshed successfully.`,
          packageName,
          manager: 'snap',
        };
      } else {
        return {
          success: false,
          message: `Snap refresh failed for ${packageName}: ${res.stderr}`,
          packageName,
          manager: 'snap',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: err.message,
        packageName,
        manager: 'snap',
      };
    }
  }
}
