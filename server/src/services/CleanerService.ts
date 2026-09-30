import os from 'os';
import path from 'path';
import { ICommandExecutor } from '../interfaces/ICommandExecutor';
import { JunkCategory, JunkScanResult } from '../models/JunkInfo';
import { Logger } from '../utils/Logger';

export class CleanerService {
  constructor(private readonly commandExecutor: ICommandExecutor) {}

  public async scanJunk(): Promise<JunkScanResult> {
    const homeDir = os.homedir();
    const categoriesToScan = [
      {
        id: 'thumbnail_cache',
        name: 'Thumbnail Cache',
        description: 'Cached image and video preview thumbnails',
        path: path.join(homeDir, '.cache', 'thumbnails'),
        safeToClean: true,
      },
      {
        id: 'user_trash',
        name: 'Trash Bin',
        description: 'Deleted files in user trash directory',
        path: path.join(homeDir, '.local/share/Trash'),
        safeToClean: true,
      },
      {
        id: 'tmp_dir',
        name: 'Temporary Files',
        description: 'Temporary user files in /tmp directory',
        path: '/tmp',
        safeToClean: true,
      },
      {
        id: 'system_logs',
        name: 'User App Cache',
        description: 'Cached application logs and data in ~/.cache',
        path: path.join(homeDir, '.cache'),
        safeToClean: false,
      },
    ];

    const categories: JunkCategory[] = [];
    let totalBytes = 0;

    for (const cat of categoriesToScan) {
      const sizeBytes = await this.getDirectorySizeBytes(cat.path);
      const sizeMB = parseFloat((sizeBytes / (1024 * 1024)).toFixed(2));
      totalBytes += sizeBytes;

      categories.push({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        path: cat.path,
        sizeBytes,
        sizeMB,
        safeToClean: cat.safeToClean,
      });
    }

    const totalMB = parseFloat((totalBytes / (1024 * 1024)).toFixed(2));
    return new JunkScanResult(categories, totalBytes, totalMB);
  }

  public async cleanJunk(targetIds: string[]): Promise<{ cleanedBytes: number; cleanedMB: number; results: string[] }> {
    const scan = await this.scanJunk();
    let cleanedBytes = 0;
    const results: string[] = [];

    for (const cat of scan.categories) {
      if (targetIds.includes(cat.id) && cat.safeToClean) {
        if (cat.id === 'thumbnail_cache') {
          await this.commandExecutor.execute('rm', ['-rf', path.join(cat.path, '*')]);
          cleanedBytes += cat.sizeBytes;
          results.push(`Cleaned ${cat.name} (${cat.sizeMB} MB)`);
        } else if (cat.id === 'user_trash') {
          await this.commandExecutor.execute('rm', ['-rf', path.join(cat.path, 'files', '*')]);
          await this.commandExecutor.execute('rm', ['-rf', path.join(cat.path, 'info', '*')]);
          cleanedBytes += cat.sizeBytes;
          results.push(`Emptied ${cat.name} (${cat.sizeMB} MB)`);
        }
      }
    }

    const cleanedMB = parseFloat((cleanedBytes / (1024 * 1024)).toFixed(2));
    return { cleanedBytes, cleanedMB, results };
  }

  private async getDirectorySizeBytes(dirPath: string): Promise<number> {
    try {
      const res = await this.commandExecutor.execute('du', ['-sb', dirPath]);
      if (res.stdout) {
        const lastLine = res.stdout.trim().split('\n').pop() || '';
        const parts = lastLine.trim().split(/\s+/);
        const bytes = parseInt(parts[0], 10);
        if (!isNaN(bytes)) return bytes;
      }
    } catch (e: any) {
      Logger.warn('CleanerService', `Failed to calculate size for ${dirPath}: ${e.message}`);
    }
    return 0;
  }
}
