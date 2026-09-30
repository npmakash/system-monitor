import { CpuInfo } from '../models/CpuInfo';
import { MemoryInfo } from '../models/MemoryInfo';
import { DiskInfo } from '../models/DiskInfo';
import { NetworkInfo } from '../models/NetworkInfo';
import { SystemSummary, SystemInformation } from '../models/SystemSummary';

export interface ISystemMonitor {
  getCpuUsage(): Promise<CpuInfo>;
  getMemoryUsage(): Promise<MemoryInfo>;
  getDiskUsage(): Promise<DiskInfo[]>;
  getNetworkUsage(): Promise<NetworkInfo>;
  getSystemUptime(): Promise<number>;
  getSystemInformation(): Promise<SystemInformation>;
  getSystemSummary(): Promise<SystemSummary>;
}
