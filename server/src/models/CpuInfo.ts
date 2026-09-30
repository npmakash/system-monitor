export interface CpuCoreUsage {
  coreId: number;
  usagePercent: number;
}

export class CpuInfo {
  constructor(
    public readonly usagePercent: number,
    public readonly cores: number,
    public readonly modelName: string,
    public readonly coreUsages: CpuCoreUsage[] = []
  ) {}
}
