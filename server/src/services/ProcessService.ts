import { IProcessManager, ProcessActionResult } from '../interfaces/IProcessManager';
import { ProcessInfo, ProcessSummary } from '../models/ProcessInfo';
import { ProcessReader } from '../system/ProcessReader';
import { ProcessSafetyService } from './ProcessSafetyService';
import { ActionLogService } from './ActionLogService';
import { ICommandExecutor } from '../interfaces/ICommandExecutor';
import { Logger } from '../utils/Logger';

export class ProcessService implements IProcessManager {
  constructor(
    private readonly processReader: ProcessReader,
    private readonly safetyService: ProcessSafetyService,
    private readonly commandExecutor: ICommandExecutor,
    private readonly actionLogService: ActionLogService
  ) {}

  public async getProcesses(): Promise<ProcessSummary> {
    return await this.processReader.readProcesses();
  }

  public async getProcessByPid(pid: number): Promise<ProcessInfo | null> {
    return await this.processReader.getProcessByPid(pid);
  }

  public async stopProcess(pid: number, signal: string = 'SIGTERM'): Promise<ProcessActionResult> {
    const processInfo = await this.getProcessByPid(pid);
    const procName = processInfo ? processInfo.command : `PID ${pid}`;

    // 1. Safety Validation
    const validation = this.safetyService.validateProcessAction(pid, procName, signal);
    if (!validation.isSafe) {
      const reason = validation.reason || 'Safety check failed.';
      this.actionLogService.logAction({
        action: `Stop Process (${signal})`,
        target: `${procName} (PID ${pid})`,
        pid,
        result: 'BLOCKED',
        userConfirmation: true,
        details: reason,
      });
      return { success: false, message: reason, action: 'STOP', pid };
    }

    // 2. Execute kill signal
    Logger.info('ProcessService', `Executing signal ${signal} against PID ${pid} (${procName})`);
    const execResult = await this.commandExecutor.execute('kill', [`-${signal}`, pid.toString()]);

    if (execResult.exitCode === 0) {
      const successMsg = `Successfully sent ${signal} to ${procName} (PID ${pid}).`;
      this.actionLogService.logAction({
        action: `Stop Process (${signal})`,
        target: `${procName} (PID ${pid})`,
        pid,
        result: 'SUCCESS',
        userConfirmation: true,
        details: successMsg,
      });
      return { success: true, message: successMsg, action: 'STOP', pid };
    } else {
      const errorMsg = `Failed to terminate ${procName} (PID ${pid}): ${execResult.stderr}`;
      this.actionLogService.logAction({
        action: `Stop Process (${signal})`,
        target: `${procName} (PID ${pid})`,
        pid,
        result: 'FAILED',
        userConfirmation: true,
        details: errorMsg,
      });
      return { success: false, message: errorMsg, action: 'STOP', pid };
    }
  }

  public async restartProcess(pid: number): Promise<ProcessActionResult> {
    const processInfo = await this.getProcessByPid(pid);
    if (!processInfo) {
      return { success: false, message: `Process with PID ${pid} not found.`, action: 'RESTART', pid };
    }

    const validation = this.safetyService.validateProcessAction(pid, processInfo.command);
    if (!validation.isSafe) {
      const reason = validation.reason || 'Safety check failed.';
      this.actionLogService.logAction({
        action: 'Restart Process',
        target: `${processInfo.command} (PID ${pid})`,
        pid,
        result: 'BLOCKED',
        userConfirmation: true,
        details: reason,
      });
      return { success: false, message: reason, action: 'RESTART', pid };
    }

    // Send SIGHUP to attempt graceful reload/restart
    Logger.info('ProcessService', `Sending SIGHUP to PID ${pid} for process reload`);
    const execResult = await this.commandExecutor.execute('kill', ['-SIGHUP', pid.toString()]);

    if (execResult.exitCode === 0) {
      const msg = `Successfully sent restart signal (SIGHUP) to ${processInfo.command} (PID ${pid}).`;
      this.actionLogService.logAction({
        action: 'Restart Process',
        target: `${processInfo.command} (PID ${pid})`,
        pid,
        result: 'SUCCESS',
        userConfirmation: true,
        details: msg,
      });
      return { success: true, message: msg, action: 'RESTART', pid };
    } else {
      const msg = `Failed to send restart signal to PID ${pid}: ${execResult.stderr}`;
      this.actionLogService.logAction({
        action: 'Restart Process',
        target: `${processInfo.command} (PID ${pid})`,
        pid,
        result: 'FAILED',
        userConfirmation: true,
        details: msg,
      });
      return { success: false, message: msg, action: 'RESTART', pid };
    }
  }
}
