import os from 'os';
import { ProcFileReader } from '../system/ProcFileReader';
import { CpuInfo, CpuCoreUsage } from '../models/CpuInfo';
import { Formatter } from '../utils/Formatter';

interface CpuTimeSnapshot {
  idle: number;
  total: number;
}

export class CpuService {
  private prevOverallSnapshot: CpuTimeSnapshot | null = null;
  private prevCoreSnapshots: Map<number, CpuTimeSnapshot> = new Map();

  constructor(private readonly procReader: ProcFileReader) {}

  /**
   * Fetches current CPU information and usage percentages
   */
  public async getCpuInfo(): Promise<CpuInfo> {
    const rawStat = await this.procReader.safeReadFile('/proc/stat', '');
    const modelName = this.getCpuModelName();
    const coreCount = os.cpus().length;

    if (!rawStat) {
      return new CpuInfo(0, coreCount, modelName, []);
    }

    const lines = rawStat.split('\n');
    let overallUsage = 0;
    const coreUsages: CpuCoreUsage[] = [];

    for (const line of lines) {
      if (line.startsWith('cpu ')) {
        const snapshot = this.parseCpuLine(line);
        if (this.prevOverallSnapshot) {
          const idleDelta = snapshot.idle - this.prevOverallSnapshot.idle;
          const totalDelta = snapshot.total - this.prevOverallSnapshot.total;
          if (totalDelta > 0) {
            overallUsage = Formatter.toPercentage(((totalDelta - idleDelta) / totalDelta) * 100);
          }
        }
        this.prevOverallSnapshot = snapshot;
      } else if (line.match(/^cpu\d+/)) {
        const match = line.match(/^cpu(\d+)/);
        if (match) {
          const coreId = parseInt(match[1], 10);
          const snapshot = this.parseCpuLine(line);
          const prevSnapshot = this.prevCoreSnapshots.get(coreId);
          let coreUsage = 0;
          if (prevSnapshot) {
            const idleDelta = snapshot.idle - prevSnapshot.idle;
            const totalDelta = snapshot.total - prevSnapshot.total;
            if (totalDelta > 0) {
              coreUsage = Formatter.toPercentage(((totalDelta - idleDelta) / totalDelta) * 100);
            }
          }
          this.prevCoreSnapshots.set(coreId, snapshot);
          coreUsages.push({ coreId, usagePercent: coreUsage });
        }
      }
    }

    return new CpuInfo(overallUsage, coreCount, modelName, coreUsages);
  }

  private parseCpuLine(line: string): CpuTimeSnapshot {
    const parts = line.trim().split(/\s+/).slice(1).map(Number);
    // user, nice, system, idle, iowait, irq, softirq, steal
    const user = parts[0] || 0;
    const nice = parts[1] || 0;
    const system = parts[2] || 0;
    const idle = parts[3] || 0;
    const iowait = parts[4] || 0;
    const irq = parts[5] || 0;
    const softirq = parts[6] || 0;
    const steal = parts[7] || 0;

    const idleTime = idle + iowait;
    const totalTime = user + nice + system + idleTime + irq + softirq + steal;

    return { idle: idleTime, total: totalTime };
  }

  private getCpuModelName(): string {
    const cpus = os.cpus();
    if (cpus && cpus.length > 0) {
      return cpus[0].model || 'Generic Linux CPU';
    }
    return 'Generic Linux CPU';
  }
}
