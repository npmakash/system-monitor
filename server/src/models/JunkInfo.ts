export interface JunkCategory {
  id: string;
  name: string;
  description: string;
  path: string;
  sizeBytes: number;
  sizeMB: number;
  safeToClean: boolean;
}

export class JunkScanResult {
  constructor(
    public readonly categories: JunkCategory[],
    public readonly totalSizeBytes: number,
    public readonly totalSizeMB: number
  ) {}
}
