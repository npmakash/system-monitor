import { ProcessInfo, ProcessSummary } from '../models/ProcessInfo';

export interface ProcessActionResult {
  success: boolean;
  message: string;
  action: string;
  pid: number;
}

export interface IProcessManager {
  getProcesses(): Promise<ProcessSummary>;
  getProcessByPid(pid: number): Promise<ProcessInfo | null>;
  stopProcess(pid: number, signal?: string): Promise<ProcessActionResult>;
  restartProcess(pid: number): Promise<ProcessActionResult>;
}
