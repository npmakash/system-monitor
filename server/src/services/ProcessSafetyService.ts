import { Logger } from '../utils/Logger';

export interface ProcessSafetyValidation {
  isSafe: boolean;
  reason?: string;
}

export class ProcessSafetyService {
  private readonly criticalProcessNames: Set<string> = new Set([
    'init',
    'systemd',
    'kthreadd',
    'dbus-daemon',
    'polkitd',
    'gnome-shell',
    'xorg',
    'wayland',
    'systemd-journal',
    'systemd-udevd',
    'systemd-logind',
  ]);

  private readonly allowedSignals: Set<string> = new Set([
    'SIGTERM',
    'SIGKILL',
    'SIGINT',
    'SIGHUP',
  ]);

  /**
   * Validates whether a process can be safely terminated or restarted
   */
  public validateProcessAction(pid: number, processName: string = '', signal: string = 'SIGTERM'): ProcessSafetyValidation {
    // 1. Validate PID range
    if (isNaN(pid) || pid <= 0) {
      return { isSafe: false, reason: 'Invalid Process ID provided.' };
    }

    // 2. Protect PID <= 10 (Init, Systemd, Kernel Threads)
    if (pid <= 10) {
      Logger.warn('ProcessSafetyService', `Blocked attempt to kill critical core system PID ${pid}`);
      return { isSafe: false, reason: `Cannot terminate critical system process (PID ${pid} <= 10).` };
    }

    // 3. Protect current Node.js System Agent process
    if (pid === process.pid) {
      Logger.warn('ProcessSafetyService', `Blocked attempt to kill System Agent backend process (PID ${pid})`);
      return { isSafe: false, reason: 'Cannot terminate the Linux System Manager backend agent process.' };
    }

    // 4. Protect critical system process names
    const cleanName = processName.trim().toLowerCase();
    for (const criticalName of this.criticalProcessNames) {
      if (cleanName === criticalName || cleanName.endsWith(`/${criticalName}`) || cleanName.includes(criticalName)) {
        Logger.warn('ProcessSafetyService', `Blocked attempt to kill critical system service: ${processName} (PID ${pid})`);
        return { isSafe: false, reason: `Action denied: '${processName}' is a protected core system process.` };
      }
    }

    // 5. Validate Signal Name
    if (!this.allowedSignals.has(signal)) {
      return { isSafe: false, reason: `Invalid signal type '${signal}'. Allowed: ${Array.from(this.allowedSignals).join(', ')}` };
    }

    return { isSafe: true };
  }

  /**
   * Check if a process is classified as protected (for UI display)
   */
  public isProtectedProcess(pid: number, processName: string = ''): boolean {
    if (pid <= 10 || pid === process.pid) return true;
    const cleanName = processName.trim().toLowerCase();
    for (const criticalName of this.criticalProcessNames) {
      if (cleanName === criticalName || cleanName.endsWith(`/${criticalName}`) || cleanName.includes(criticalName)) {
        return true;
      }
    }
    return false;
  }
}
