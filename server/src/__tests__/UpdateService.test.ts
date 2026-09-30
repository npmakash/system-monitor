import { UpdateService } from '../services/UpdateService';
import { UpdatePolicyService } from '../services/UpdatePolicyService';
import { ActionLogService } from '../services/ActionLogService';
import { IUpdateManager } from '../interfaces/IUpdateManager';

describe('UpdateService', () => {
  let mockAptManager: jest.Mocked<IUpdateManager>;
  let mockSnapManager: jest.Mocked<IUpdateManager>;
  let policyService: UpdatePolicyService;
  let actionLogService: ActionLogService;
  let updateService: UpdateService;

  beforeEach(() => {
    mockAptManager = {
      managerName: 'apt',
      checkUpdates: jest.fn(),
      applyUpdate: jest.fn(),
    };
    mockSnapManager = {
      managerName: 'snap',
      checkUpdates: jest.fn(),
      applyUpdate: jest.fn(),
    };

    policyService = new UpdatePolicyService();
    actionLogService = new ActionLogService();
    updateService = new UpdateService([mockAptManager, mockSnapManager], policyService, actionLogService);
  });

  test('checkAllUpdates aggregates updates across package managers', async () => {
    mockAptManager.checkUpdates.mockResolvedValueOnce([
      { name: 'curl', manager: 'apt', currentVersion: '7.81', availableVersion: '7.82' },
    ]);
    mockSnapManager.checkUpdates.mockResolvedValueOnce([
      { name: 'firefox', manager: 'snap', currentVersion: '119.0', availableVersion: '120.0' },
    ]);

    const result = await updateService.checkAllUpdates();
    expect(result.total).toBe(2);
    expect(result.apt.length).toBe(1);
    expect(result.snap.length).toBe(1);
  });

  test('approveAndUpdate blocks update if user confirmation is missing when required', async () => {
    policyService.updateSettings({ requireConfirmation: true });

    const result = await updateService.approveAndUpdate('apt', 'curl', false);
    expect(result.success).toBe(false);
    expect(result.message).toContain('User approval required');
  });

  test('approveAndUpdate executes update when userConfirmed is true', async () => {
    mockAptManager.applyUpdate.mockResolvedValueOnce({
      success: true,
      message: 'Updated curl successfully',
      packageName: 'curl',
      manager: 'apt',
    });

    const result = await updateService.approveAndUpdate('apt', 'curl', true);
    expect(result.success).toBe(true);
    expect(mockAptManager.applyUpdate).toHaveBeenCalledWith('curl');
  });
});
