import { ServiceManager } from '../services/ServiceManager';
import { SystemdManager } from '../system/SystemdManager';
import { ICommandExecutor } from '../interfaces/ICommandExecutor';
import { ActionLogService } from '../services/ActionLogService';

describe('ServiceManager', () => {
  let mockSystemdManager: jest.Mocked<SystemdManager>;
  let mockExecutor: jest.Mocked<ICommandExecutor>;
  let actionLogService: ActionLogService;
  let serviceManager: ServiceManager;

  beforeEach(() => {
    mockSystemdManager = {
      getServices: jest.fn(),
      isProtectedService: jest.fn(),
    } as any;
    mockExecutor = {
      execute: jest.fn(),
    };
    actionLogService = new ActionLogService();
    serviceManager = new ServiceManager(mockSystemdManager, mockExecutor, actionLogService);
  });

  test('blocks action on protected systemd services', async () => {
    mockSystemdManager.isProtectedService.mockReturnValue(true);

    const res = await serviceManager.controlService('dbus.service', 'stop', true);
    expect(res.success).toBe(false);
    expect(res.message).toContain('protected core systemd service');
  });

  test('executes systemctl control for non-protected service when userConfirmed is true', async () => {
    mockSystemdManager.isProtectedService.mockReturnValue(false);
    mockExecutor.execute.mockResolvedValueOnce({
      stdout: '',
      stderr: '',
      exitCode: 0,
    });

    const res = await serviceManager.controlService('nginx.service', 'restart', true);
    expect(res.success).toBe(true);
    expect(mockExecutor.execute).toHaveBeenCalledWith('systemctl', ['restart', 'nginx.service']);
  });
});
