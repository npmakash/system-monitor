export interface UpdateInfo {
  name: string;
  manager: 'apt' | 'snap' | 'flatpak';
  currentVersion: string;
  availableVersion: string;
  sizeMB?: number;
  description?: string;
  isSecurityUpdate?: boolean;
}

export interface UpdateResult {
  success: boolean;
  message: string;
  packageName: string;
  manager: string;
}

export interface IUpdateManager {
  readonly managerName: 'apt' | 'snap' | 'flatpak';
  checkUpdates(): Promise<UpdateInfo[]>;
  applyUpdate(packageName: string): Promise<UpdateResult>;
}
