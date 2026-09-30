export class Formatter {
  public static bytesToGB(bytes: number): number {
    return parseFloat((bytes / (1024 * 1024 * 1024)).toFixed(2));
  }

  public static bytesToFormattedSpeed(bytesPerSec: number): string {
    if (bytesPerSec < 1024) {
      return `${bytesPerSec.toFixed(0)} B/s`;
    } else if (bytesPerSec < 1024 * 1024) {
      return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
    } else if (bytesPerSec < 1024 * 1024 * 1024) {
      return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
    } else {
      return `${(bytesPerSec / (1024 * 1024 * 1024)).toFixed(2)} GB/s`;
    }
  }

  public static formatUptime(seconds: number): string {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);

    return parts.join(' ');
  }

  public static toPercentage(value: number): number {
    if (isNaN(value) || !isFinite(value)) return 0;
    return parseFloat(Math.min(100, Math.max(0, value)).toFixed(1));
  }
}
