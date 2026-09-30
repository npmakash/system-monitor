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

export class ProcessSummary {
  constructor(
    public readonly totalProcesses: number,
    public readonly runningProcesses: number,
    public readonly sleepingProcesses: number,
    public readonly processes: ProcessInfo[]
  ) {}
}
