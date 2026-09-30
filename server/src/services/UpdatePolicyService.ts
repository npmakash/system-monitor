export interface UpdatePolicySettings {
  largeDownloadThresholdMB: number;
  requireConfirmation: boolean;
  allowAutomaticSmallUpdates: boolean;
  notifyOnly: boolean;
}

export class UpdatePolicyService {
  private settings: UpdatePolicySettings = {
    largeDownloadThresholdMB: 50,
    requireConfirmation: true,
    allowAutomaticSmallUpdates: false,
    notifyOnly: true,
  };

  public getSettings(): UpdatePolicySettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<UpdatePolicySettings>): UpdatePolicySettings {
    this.settings = { ...this.settings, ...newSettings };
    return this.getSettings();
  }

  public requiresExplicitConfirmation(sizeMB?: number): boolean {
    if (this.settings.requireConfirmation) return true;
    if (sizeMB && sizeMB > this.settings.largeDownloadThresholdMB) return true;
    return false;
  }
}
