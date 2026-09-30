import { ProcFileReader } from '../system/ProcFileReader';
import { ICommandExecutor } from '../interfaces/ICommandExecutor';
import { NetworkInfo, InterfaceSpeed, NetworkConnection } from '../models/NetworkInfo';
import { Formatter } from '../utils/Formatter';
import { Logger } from '../utils/Logger';

interface NetSnapshot {
  timestamp: number;
  rxBytes: number;
  txBytes: number;
}

export class NetworkService {
  private prevSnapshots: Map<string, NetSnapshot> = new Map();

  constructor(
    private readonly procReader: ProcFileReader,
    private readonly commandExecutor?: ICommandExecutor
  ) {}

  /**
   * Reads /proc/net/dev and calculates Rx/Tx bandwidth throughput per interface
   * and fetches active socket connections with PID association
   */
  public async getNetworkInfo(): Promise<NetworkInfo> {
    const rawNetDev = await this.procReader.safeReadFile('/proc/net/dev', '');
    const now = Date.now();

    if (!rawNetDev) {
      const connections = await this.getNetworkConnections();
      return new NetworkInfo(0, 0, '0 B/s', '0 B/s', [], connections);
    }

    const lines = rawNetDev.split('\n');
    const interfaces: InterfaceSpeed[] = [];
    let totalRxSpeed = 0;
    let totalTxSpeed = 0;

    for (const line of lines) {
      if (!line.includes(':')) continue;
      const [ifaceRaw, statsRaw] = line.split(':');
      const iface = ifaceRaw.trim();
      const stats = statsRaw.trim().split(/\s+/).map(Number);

      const rxBytes = stats[0] || 0; // Receive bytes
      const txBytes = stats[8] || 0; // Transmit bytes

      const prev = this.prevSnapshots.get(iface);
      let rxSpeedSec = 0;
      let txSpeedSec = 0;

      if (prev) {
        const timeDeltaSec = (now - prev.timestamp) / 1000;
        if (timeDeltaSec > 0) {
          rxSpeedSec = Math.max(0, (rxBytes - prev.rxBytes) / timeDeltaSec);
          txSpeedSec = Math.max(0, (txBytes - prev.txBytes) / timeDeltaSec);
        }
      }

      this.prevSnapshots.set(iface, { timestamp: now, rxBytes, txBytes });

      // Exclude loopback from overall aggregate summary speed
      if (iface !== 'lo') {
        totalRxSpeed += rxSpeedSec;
        totalTxSpeed += txSpeedSec;
      }

      interfaces.push({
        interfaceName: iface,
        downloadSpeedBytesSec: rxSpeedSec,
        uploadSpeedBytesSec: txSpeedSec,
        downloadSpeedFormatted: Formatter.bytesToFormattedSpeed(rxSpeedSec),
        uploadSpeedFormatted: Formatter.bytesToFormattedSpeed(txSpeedSec),
      });
    }

    const connections = await this.getNetworkConnections();

    return new NetworkInfo(
      totalRxSpeed,
      totalTxSpeed,
      Formatter.bytesToFormattedSpeed(totalRxSpeed),
      Formatter.bytesToFormattedSpeed(totalTxSpeed),
      interfaces,
      connections
    );
  }

  /**
   * Executes ss -tulnp to inspect active socket connections and map PIDs / process names
   */
  public async getNetworkConnections(): Promise<NetworkConnection[]> {
    if (!this.commandExecutor) return [];

    try {
      // ss -tulnp (tcp/udp, listening & non-listening, numeric, process info)
      const res = await this.commandExecutor.execute('ss', ['-tulnp']);
      if (res.exitCode !== 0 || !res.stdout) {
        return [];
      }

      const lines = res.stdout.trim().split('\n').slice(1);
      const connections: NetworkConnection[] = [];

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          const protocol = parts[0];
          const state = parts[1];
          const localAddress = parts[4];
          const remoteAddress = parts[5] || '*:*';
          const processCol = parts.slice(6).join(' ');

          let pid: number | undefined;
          let processName: string | undefined;

          // Parse users:(("process_name",pid=1234,fd=5))
          const match = processCol.match(/users:\(\("([^"]+)",pid=(\d+)/);
          if (match) {
            processName = match[1];
            pid = parseInt(match[2], 10);
          } else {
            const fallbackMatch = processCol.match(/pid=(\d+)/);
            if (fallbackMatch) pid = parseInt(fallbackMatch[1], 10);
          }

          connections.push({
            protocol,
            localAddress,
            remoteAddress,
            state: state === '0' || state === 'ESTAB' ? 'ESTABLISHED' : state,
            pid,
            processName,
          });
        }
      }

      return connections;
    } catch (err: any) {
      Logger.warn('NetworkService', `Failed to fetch active network connections: ${err.message}`);
      return [];
    }
  }
}
