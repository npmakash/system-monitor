import { DiskService } from '../services/DiskService';
import { ICommandExecutor } from '../interfaces/ICommandExecutor';

describe('DiskService', () => {
  let mockExecutor: jest.Mocked<ICommandExecutor>;
  let diskService: DiskService;

  beforeEach(() => {
    mockExecutor = {
      execute: jest.fn(),
    };
    diskService = new DiskService(mockExecutor);
  });

  test('getDiskInfo parses df command output properly', async () => {
    const mockDfOutput = `Filesystem fstype 1B-blocks Used Available Mounted
/dev/sda1 ext4 500000000000 200000000000 300000000000 /
tmpfs tmpfs 8000000000 0 8000000000 /dev/shm`;

    mockExecutor.execute.mockResolvedValueOnce({
      stdout: mockDfOutput,
      stderr: '',
      exitCode: 0,
    });

    const result = await diskService.getDiskInfo();
    expect(result.length).toBe(1);
    expect(result[0].filesystem).toBe('/dev/sda1');
    expect(result[0].mountPoint).toBe('/');
    expect(result[0].usagePercent).toBe(40);
  });
});
