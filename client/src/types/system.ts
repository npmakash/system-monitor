export interface SystemInformation {
  hostname: string;
  platform: string;
  distro: string;
  kernel: string;
  arch: string;
  uptimeSeconds: number;
  uptimeFormatted: string;
}

export interface CpuCoreUsage {
  coreId: number;
  usagePercent: number;
}

export interface CpuInfo {
  usagePercent: number;
  cores: number;
  modelName: string;
  coreUsages: CpuCoreUsage[];
}

export interface RamDetails {
  totalBytes: number;
  usedBytes: number;
  availableBytes: number;
  freeBytes: number;
  buffersBytes: number;
  cachedBytes: number;
  totalGB: number;
  usedGB: number;
  availableGB: number;
  usagePercent: number;
}

export interface SwapDetails {
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  totalGB: number;
  usedGB: number;
  usagePercent: number;
}

export interface MemoryInfo {
  memory: RamDetails;
  swap: SwapDetails;
}

export interface DiskInfo {
  filesystem: string;
  type: string;
  mountPoint: string;
  totalBytes: number;
  usedBytes: number;
  availableBytes: number;
  totalGB: number;
  usedGB: number;
  availableGB: number;
  usagePercent: number;
}

export interface InterfaceSpeed {
  interfaceName: string;
  downloadSpeedBytesSec: number;
  uploadSpeedBytesSec: number;
  downloadSpeedFormatted: string;
  uploadSpeedFormatted: string;
}

export interface NetworkConnection {
  protocol: string;
  localAddress: string;
  remoteAddress: string;
  state: string;
  pid?: number;
  processName?: string;
}

export interface NetworkInfo {
  totalDownloadSpeedBytesSec: number;
  totalUploadSpeedBytesSec: number;
  downloadSpeedFormatted: string;
  uploadSpeedFormatted: string;
  interfaces: InterfaceSpeed[];
  connections: NetworkConnection[];
}

export interface SystemSummary {
  info: SystemInformation;
  cpu: CpuInfo;
  memory: MemoryInfo;
  disks: DiskInfo[];
  network: NetworkInfo;
  timestamp: string;
}

export interface ProcessInfo {
  pid: number;
  ppid: number;
  user: string;
  cpuPercent: number;
  memPercent: number;
  vszBytes: number;
  rssBytes: number;
  ramMB: number;
  stat: string;
  startTime: string;
  cpuTime: string;
  command: string;
  fullArgs?: string;
  isProtected?: boolean;
}

export interface ProcessSummary {
  totalProcesses: number;
  runningProcesses: number;
  sleepingProcesses: number;
  processes: ProcessInfo[];
}

export interface ActionLogItem {
  id: string;
  timestamp: string;
  action: string;
  target: string;
  pid?: number;
  result: 'SUCCESS' | 'BLOCKED' | 'FAILED';
  userConfirmation: boolean;
  details: string;
}

export interface UpdateInfo {
  name: string;
  manager: 'apt' | 'snap' | 'flatpak';
  currentVersion: string;
  availableVersion: string;
  sizeMB?: number;
  description?: string;
  isSecurityUpdate?: boolean;
}

export interface UpdateSummary {
  apt: UpdateInfo[];
  snap: UpdateInfo[];
  flatpak: UpdateInfo[];
  total: number;
}

export interface UpdatePolicySettings {
  largeDownloadThresholdMB: number;
  requireConfirmation: boolean;
  allowAutomaticSmallUpdates: boolean;
  notifyOnly: boolean;
}

export interface ServiceInfo {
  name: string;
  description: string;
  loadState: string;
  activeState: string;
  subState: string;
  unitFileState: string;
  isProtected?: boolean;
}

export interface StartupAppInfo {
  name: string;
  command: string;
  enabled: boolean;
  filePath: string;
  comment?: string;
}

export interface JunkCategory {
  id: string;
  name: string;
  description: string;
  path: string;
  sizeBytes: number;
  sizeMB: number;
  safeToClean: boolean;
}

export interface JunkScanResult {
  categories: JunkCategory[];
  totalSizeBytes: number;
  totalSizeMB: number;
}
