import os from 'os';
import { ISystemMonitor } from '../interfaces/ISystemMonitor';
import { CpuService } from './CpuService';
import { MemoryService } from './MemoryService';
import { DiskService } from './DiskService';
import { NetworkService } from './NetworkService';
import { ProcFileReader } from '../system/ProcFileReader';
import { CpuInfo } from '../models/CpuInfo';
import { MemoryInfo } from '../models/MemoryInfo';
import { DiskInfo } from '../models/DiskInfo';
import { NetworkInfo } from '../models/NetworkInfo';
import { SystemSummary, SystemInformation } from '../models/SystemSummary';
import { Formatter } from '../utils/Formatter';

export class SystemMonitorService implements ISystemMonitor {
  constructor(
    private readonly cpuService: CpuService,
    private readonly memoryService: MemoryService,
    private readonly diskService: DiskService,
    private readonly networkService: NetworkService,
    private readonly procReader: ProcFileReader
  ) {}

  public async getCpuUsage(): Promise<CpuInfo> {
    return await this.cpuService.getCpuInfo();
  }

  public async getMemoryUsage(): Promise<MemoryInfo> {
    return await this.memoryService.getMemoryInfo();
  }

  public async getDiskUsage(): Promise<DiskInfo[]> {
    return await this.diskService.getDiskInfo();
  }

  public async getNetworkUsage(): Promise<NetworkInfo> {
    return await this.networkService.getNetworkInfo();
  }

  public async getSystemUptime(): Promise<number> {
    const rawUptime = await this.procReader.safeReadFile('/proc/uptime', '');
    if (rawUptime) {
      const parts = rawUptime.trim().split(/\s+/);
      const uptimeSec = parseFloat(parts[0]);
      if (!isNaN(uptimeSec)) {
        return Math.floor(uptimeSec);
      }
    }
    return Math.floor(os.uptime());
  }

  public async getSystemInformation(): Promise<SystemInformation> {
    const hostname = os.hostname();
    const platform = os.platform();
    const kernel = os.release();
    const arch = os.arch();
    const uptimeSeconds = await this.getSystemUptime();

    let distro = 'Linux';
    const osRelease = await this.procReader.safeReadFile('/etc/os-release', '');
    if (osRelease) {
      const match = osRelease.match(/^PRETTY_NAME="?([^"\n]+)"?/m);
      if (match) {
        distro = match[1];
      }
    }

    return {
      hostname,
      platform,
      distro,
      kernel,
      arch,
      uptimeSeconds,
      uptimeFormatted: Formatter.formatUptime(uptimeSeconds),
    };
  }

  public async getSystemSummary(): Promise<SystemSummary> {
    const [info, cpu, memory, disks, network] = await Promise.all([
      this.getSystemInformation(),
      this.getCpuUsage(),
      this.getMemoryUsage(),
      this.getDiskUsage(),
      this.getNetworkUsage(),
    ]);

    return new SystemSummary(info, cpu, memory, disks, network, new Date().toISOString());
  }
}
