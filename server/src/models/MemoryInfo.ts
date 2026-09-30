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

export class MemoryInfo {
  constructor(
    public readonly memory: RamDetails,
    public readonly swap: SwapDetails
  ) {}
}
