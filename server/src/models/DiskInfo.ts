export class DiskInfo {
  constructor(
    public readonly filesystem: string,
    public readonly type: string,
    public readonly mountPoint: string,
    public readonly totalBytes: number,
    public readonly usedBytes: number,
    public readonly availableBytes: number,
    public readonly totalGB: number,
    public readonly usedGB: number,
    public readonly availableGB: number,
    public readonly usagePercent: number
  ) {}
}
