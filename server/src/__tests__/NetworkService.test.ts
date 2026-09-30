import { NetworkService } from '../services/NetworkService';
import { ProcFileReader } from '../system/ProcFileReader';
import { ICommandExecutor } from '../interfaces/ICommandExecutor';

describe('NetworkService', () => {
  let mockProcReader: jest.Mocked<ProcFileReader>;
  let mockExecutor: jest.Mocked<ICommandExecutor>;
  let networkService: NetworkService;

  beforeEach(() => {
    mockProcReader = {
      readFile: jest.fn(),
      safeReadFile: jest.fn(),
    } as any;
    mockExecutor = {
      execute: jest.fn(),
    };
    networkService = new NetworkService(mockProcReader, mockExecutor);
  });

  test('getNetworkInfo parses proc net dev and ss socket connections correctly', async () => {
    const mockNetDev = `Inter-|   Receive                                                |  Transmit
 face |bytes    packets errs drop fifo frame compressed multicast|bytes    packets errs drop fifo colls carrier compressed
    lo: 500000       0    0    0    0     0          0         0   500000       0    0    0    0     0       0          0
  eth0: 1000000      0    0    0    0     0          0         0  2000000       0    0    0    0     0       0          0`;

    const mockSsOutput = `Netid State Recv-Q Send-Q Local Address:Port Peer Address:Port Process
tcp ESTAB 0 0 127.0.0.1:3001 127.0.0.1:54321 users:(("node",pid=1234,fd=19))
udp UNCONN 0 0 0.0.0.0:53 0.0.0.0:* users:(("systemd-resolve",pid=800,fd=12))`;

    mockProcReader.safeReadFile.mockResolvedValueOnce(mockNetDev);
    mockExecutor.execute.mockResolvedValueOnce({
      stdout: mockSsOutput,
      stderr: '',
      exitCode: 0,
    });

    const info = await networkService.getNetworkInfo();

    expect(info.interfaces.length).toBe(2);
    expect(info.connections.length).toBe(2);
    expect(info.connections[0].processName).toBe('node');
    expect(info.connections[0].pid).toBe(1234);
    expect(info.connections[0].localAddress).toBe('127.0.0.1:3001');
    expect(info.connections[1].processName).toBe('systemd-resolve');
  });
});
