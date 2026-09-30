import { CpuInfo } from './CpuInfo';
import { MemoryInfo } from './MemoryInfo';
import { DiskInfo } from './DiskInfo';
import { NetworkInfo } from './NetworkInfo';

export interface SystemInformation {
  hostname: string;
  platform: string;
  distro: string;
  kernel: string;
  arch: string;
  uptimeSeconds: number;
  uptimeFormatted: string;
}

export class SystemSummary {
  constructor(
    public readonly info: SystemInformation,
    public readonly cpu: CpuInfo,
    public readonly memory: MemoryInfo,
    public readonly disks: DiskInfo[],
    public readonly network: NetworkInfo,
    public readonly timestamp: string
  ) {}
}
