import { ICommandExecutor } from '../interfaces/ICommandExecutor';
import { ProcessInfo, ProcessSummary } from '../models/ProcessInfo';
import { ProcessSafetyService } from '../services/ProcessSafetyService';
import { Formatter } from '../utils/Formatter';

export class ProcessReader {
  constructor(
    private readonly commandExecutor: ICommandExecutor,
    private readonly safetyService: ProcessSafetyService
  ) {}

  public async readProcesses(): Promise<ProcessSummary> {
    // ps -eo pid,ppid,user,%cpu,%mem,vsz,rss,stat,start,time,comm,args --sort=-%cpu
    const result = await this.commandExecutor.execute('ps', [
      '-eo',
      'pid,ppid,user,%cpu,%mem,vsz,rss,stat,start,time,comm,args',
      '--sort=-%cpu',
    ]);

    if (result.exitCode !== 0 || !result.stdout) {
      return new ProcessSummary(0, 0, 0, []);
    }

    const lines = result.stdout.trim().split('\n').slice(1);
    const processes: ProcessInfo[] = [];
    let runningCount = 0;
    let sleepingCount = 0;

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 11) {
        const [pidStr, ppidStr, user, cpuStr, memStr, vszStr, rssStr, stat, startTime, cpuTime, comm, ...argsParts] = parts;
        const pid = parseInt(pidStr, 10);
        const ppid = parseInt(ppidStr, 10);
        if (isNaN(pid)) continue;

        const cpuPercent = Formatter.toPercentage(parseFloat(cpuStr) || 0);
        const memPercent = Formatter.toPercentage(parseFloat(memStr) || 0);
        const vszBytes = (parseInt(vszStr, 10) || 0) * 1024;
        const rssBytes = (parseInt(rssStr, 10) || 0) * 1024;
        const ramMB = parseFloat((rssBytes / (1024 * 1024)).toFixed(1));
        const fullArgs = argsParts.length > 0 ? argsParts.join(' ') : comm;

        if (stat.startsWith('R')) runningCount++;
        else if (stat.startsWith('S') || stat.startsWith('I')) sleepingCount++;

        const isProtected = this.safetyService.isProtectedProcess(pid, comm);

        processes.push({
          pid,
          ppid: isNaN(ppid) ? 0 : ppid,
          user,
          cpuPercent,
          memPercent,
          vszBytes,
          rssBytes,
          ramMB,
          stat,
          startTime,
          cpuTime,
          command: comm,
          fullArgs,
          isProtected,
        });
      }
    }

    return new ProcessSummary(processes.length, runningCount, sleepingCount, processes);
  }

  public async getProcessByPid(pid: number): Promise<ProcessInfo | null> {
    const summary = await this.readProcesses();
    return summary.processes.find((p) => p.pid === pid) || null;
  }
}
