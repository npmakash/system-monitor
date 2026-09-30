import { ICommandExecutor } from '../interfaces/ICommandExecutor';
import { DiskInfo } from '../models/DiskInfo';
import { Formatter } from '../utils/Formatter';

export class DiskService {
  constructor(private readonly commandExecutor: ICommandExecutor) {}

  /**
   * Executes df command to fetch mounted filesystem disk usage information
   */
  public async getDiskInfo(): Promise<DiskInfo[]> {
    // df -B1 --output=source,fstype,size,used,avail,target
    const result = await this.commandExecutor.execute('df', ['-B1', '--output=source,fstype,size,used,avail,target']);
    
    if (result.exitCode !== 0 || !result.stdout) {
      return [];
    }

    const lines = result.stdout.trim().split('\n').slice(1);
    const disks: DiskInfo[] = [];

    // Virtual filesystem types to filter out from main view
    const excludedFstypes = new Set(['tmpfs', 'devtmpfs', 'squashfs', 'overlay', 'ecryptfs', 'proc', 'sysfs']);

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 6) {
        const [filesystem, fstype, sizeStr, usedStr, availStr, ...targetParts] = parts;
        const mountPoint = targetParts.join(' ');

        if (excludedFstypes.has(fstype) || filesystem === 'none') {
          continue;
        }

        const totalBytes = parseInt(sizeStr, 10) || 0;
        const usedBytes = parseInt(usedStr, 10) || 0;
        const availableBytes = parseInt(availStr, 10) || 0;

        if (totalBytes === 0) continue;

        const usagePercent = Formatter.toPercentage((usedBytes / totalBytes) * 100);

        disks.push(
          new DiskInfo(
            filesystem,
            fstype,
            mountPoint,
            totalBytes,
            usedBytes,
            availableBytes,
            Formatter.bytesToGB(totalBytes),
            Formatter.bytesToGB(usedBytes),
            Formatter.bytesToGB(availableBytes),
            usagePercent
          )
        );
      }
    }

    return disks;
  }
}
