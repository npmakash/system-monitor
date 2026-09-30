export interface ServiceInfo {
  name: string;
  description: string;
  loadState: string;
  activeState: string;
  subState: string;
  unitFileState: string;
  isProtected?: boolean;
}

export interface StartupAppInfo {
  name: string;
  command: string;
  enabled: boolean;
  filePath: string;
  comment?: string;
}
