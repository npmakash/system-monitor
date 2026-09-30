export interface InterfaceSpeed {
  interfaceName: string;
  downloadSpeedBytesSec: number;
  uploadSpeedBytesSec: number;
  downloadSpeedFormatted: string;
  uploadSpeedFormatted: string;
}

export interface NetworkConnection {
  protocol: string;
  localAddress: string;
  remoteAddress: string;
  state: string;
  pid?: number;
  processName?: string;
}

export class NetworkInfo {
  constructor(
    public readonly totalDownloadSpeedBytesSec: number,
    public readonly totalUploadSpeedBytesSec: number,
    public readonly downloadSpeedFormatted: string,
    public readonly uploadSpeedFormatted: string,
    public readonly interfaces: InterfaceSpeed[],
    public readonly connections: NetworkConnection[] = []
  ) {}
}
