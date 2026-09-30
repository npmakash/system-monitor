import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { StartupAppInfo } from '../models/ServiceInfo';
import { Logger } from '../utils/Logger';

export class StartupAppService {
  public async getStartupApps(): Promise<StartupAppInfo[]> {
    const homeDir = os.homedir();
    const directories = [
      path.join(homeDir, '.config', 'autostart'),
      '/etc/xdg/autostart',
    ];

    const apps: StartupAppInfo[] = [];

    for (const dir of directories) {
      try {
        const files = await fs.readdir(dir);
        for (const file of files) {
          if (file.endsWith('.desktop')) {
            const filePath = path.join(dir, file);
            const content = await fs.readFile(filePath, 'utf-8').catch(() => '');
            if (content) {
              const nameMatch = content.match(/^Name=(.+)$/m);
              const execMatch = content.match(/^Exec=(.+)$/m);
              const enabledMatch = content.match(/^(X-GNOME-Autostart-enabled|Hidden)=(true|false)$/im);

              const name = nameMatch ? nameMatch[1].trim() : file.replace('.desktop', '');
              const command = execMatch ? execMatch[1].trim() : 'Unknown';
              const enabled = enabledMatch ? enabledMatch[2].toLowerCase() !== 'true' : true;

              apps.push({
                name,
                command,
                enabled,
                filePath,
              });
            }
          }
        }
      } catch (err: any) {
        Logger.debug('StartupAppService', `Could not read directory ${dir}: ${err.message}`);
      }
    }

    return apps;
  }
}
