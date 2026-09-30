import { IUpdateManager, UpdateInfo, UpdateResult } from '../interfaces/IUpdateManager';
import { UpdatePolicyService } from './UpdatePolicyService';
import { ActionLogService } from './ActionLogService';
import { Logger } from '../utils/Logger';

export class UpdateService {
  private readonly managers: Map<string, IUpdateManager> = new Map();

  constructor(
    managers: IUpdateManager[],
    private readonly policyService: UpdatePolicyService,
    private readonly actionLogService: ActionLogService
  ) {
    for (const m of managers) {
      this.managers.set(m.managerName, m);
    }
  }

  public async checkAllUpdates(): Promise<{ apt: UpdateInfo[]; snap: UpdateInfo[]; flatpak: UpdateInfo[]; total: number }> {
    const aptManager = this.managers.get('apt');
    const snapManager = this.managers.get('snap');
    const flatpakManager = this.managers.get('flatpak');

    const [apt, snap, flatpak] = await Promise.all([
      aptManager ? aptManager.checkUpdates() : Promise.resolve([]),
      snapManager ? snapManager.checkUpdates() : Promise.resolve([]),
      flatpakManager ? flatpakManager.checkUpdates() : Promise.resolve([]),
    ]);

    const total = apt.length + snap.length + flatpak.length;
    return { apt, snap, flatpak, total };
  }

  public async checkUpdatesByManager(managerName: 'apt' | 'snap' | 'flatpak'): Promise<UpdateInfo[]> {
    const mgr = this.managers.get(managerName);
    if (!mgr) return [];
    return await mgr.checkUpdates();
  }

  public async approveAndUpdate(
    managerName: 'apt' | 'snap' | 'flatpak',
    packageName: string,
    userConfirmed: boolean = false
  ): Promise<UpdateResult> {
    const mgr = this.managers.get(managerName);
    if (!mgr) {
      return {
        success: false,
        message: `Package manager '${managerName}' not supported.`,
        packageName,
        manager: managerName,
      };
    }

    if (!userConfirmed && this.policyService.requiresExplicitConfirmation()) {
      const msg = `User approval required to execute update for ${packageName} (${managerName}).`;
      this.actionLogService.logAction({
        action: `Update Package (${managerName})`,
        target: `${packageName} (${managerName})`,
        result: 'BLOCKED',
        userConfirmation: false,
        details: msg,
      });
      return { success: false, message: msg, packageName, manager: managerName };
    }

    Logger.info('UpdateService', `Applying update for ${packageName} using ${managerName}`);
    const result = await mgr.applyUpdate(packageName);

    this.actionLogService.logAction({
      action: `Update Package (${managerName})`,
      target: `${packageName} (${managerName})`,
      result: result.success ? 'SUCCESS' : 'FAILED',
      userConfirmation: userConfirmed,
      details: result.message,
    });

    return result;
  }
}
