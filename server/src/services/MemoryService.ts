import { ProcFileReader } from '../system/ProcFileReader';
import { MemoryInfo, RamDetails, SwapDetails } from '../models/MemoryInfo';
import { Formatter } from '../utils/Formatter';

export class MemoryService {
  constructor(private readonly procReader: ProcFileReader) {}

  /**
   * Reads /proc/meminfo and calculates accurate RAM and Swap statistics
   */
  public async getMemoryInfo(): Promise<MemoryInfo> {
    const rawMemInfo = await this.procReader.safeReadFile('/proc/meminfo', '');
    const memData: Record<string, number> = {};

    if (rawMemInfo) {
      const lines = rawMemInfo.split('\n');
      for (const line of lines) {
        const match = line.match(/^([A-Za-z0-9_()]+):\s+(\d+)/);
        if (match) {
          // Convert kB to Bytes
          memData[match[1]] = parseInt(match[2], 10) * 1024;
        }
      }
    }

    const totalBytes = memData['MemTotal'] || 0;
    const freeBytes = memData['MemFree'] || 0;
    const availableBytes = memData['MemAvailable'] !== undefined 
      ? memData['MemAvailable'] 
      : (freeBytes + (memData['Buffers'] || 0) + (memData['Cached'] || 0));

    const usedBytes = Math.max(0, totalBytes - availableBytes);
    const buffersBytes = memData['Buffers'] || 0;
    const cachedBytes = memData['Cached'] || 0;
    const ramUsagePercent = totalBytes > 0 ? Formatter.toPercentage((usedBytes / totalBytes) * 100) : 0;

    const ramDetails: RamDetails = {
      totalBytes,
      usedBytes,
      availableBytes,
      freeBytes,
      buffersBytes,
      cachedBytes,
      totalGB: Formatter.bytesToGB(totalBytes),
      usedGB: Formatter.bytesToGB(usedBytes),
      availableGB: Formatter.bytesToGB(availableBytes),
      usagePercent: ramUsagePercent,
    };

    const swapTotalBytes = memData['SwapTotal'] || 0;
    const swapFreeBytes = memData['SwapFree'] || 0;
    const swapUsedBytes = Math.max(0, swapTotalBytes - swapFreeBytes);
    const swapUsagePercent = swapTotalBytes > 0 ? Formatter.toPercentage((swapUsedBytes / swapTotalBytes) * 100) : 0;

    const swapDetails: SwapDetails = {
      totalBytes: swapTotalBytes,
      usedBytes: swapUsedBytes,
      freeBytes: swapFreeBytes,
      totalGB: Formatter.bytesToGB(swapTotalBytes),
      usedGB: Formatter.bytesToGB(swapUsedBytes),
      usagePercent: swapUsagePercent,
    };

    return new MemoryInfo(ramDetails, swapDetails);
  }
}
