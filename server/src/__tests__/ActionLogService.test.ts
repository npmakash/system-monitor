import { ActionLogService } from '../services/ActionLogService';

describe('ActionLogService', () => {
  let logService: ActionLogService;

  beforeEach(() => {
    logService = new ActionLogService();
  });

  test('logs activity items and retrieves logs in reverse chronological order', () => {
    logService.logAction({
      action: 'Stop Process',
      target: 'firefox (PID 2000)',
      pid: 2000,
      result: 'SUCCESS',
      userConfirmation: true,
      details: 'User stopped process',
    });

    logService.logAction({
      action: 'Stop Process',
      target: 'systemd (PID 1)',
      pid: 1,
      result: 'BLOCKED',
      userConfirmation: true,
      details: 'Blocked core process',
    });

    const logs = logService.getLogs();
    expect(logs.length).toBe(2);
    expect(logs[0].target).toContain('systemd');
    expect(logs[0].result).toBe('BLOCKED');
    expect(logs[1].target).toContain('firefox');
    expect(logs[1].result).toBe('SUCCESS');
  });

  test('clears logs properly', () => {
    logService.logAction({
      action: 'Test',
      target: 'Target',
      result: 'SUCCESS',
      userConfirmation: false,
      details: 'Details',
    });
    expect(logService.getLogs().length).toBe(1);

    logService.clearLogs();
    expect(logService.getLogs().length).toBe(0);
  });
});
