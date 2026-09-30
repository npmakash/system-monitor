import { MemoryService } from '../services/MemoryService';
import { ProcFileReader } from '../system/ProcFileReader';

describe('MemoryService', () => {
  let mockProcReader: jest.Mocked<ProcFileReader>;
  let memoryService: MemoryService;

  beforeEach(() => {
    mockProcReader = {
      readFile: jest.fn(),
      safeReadFile: jest.fn(),
    } as any;
    memoryService = new MemoryService(mockProcReader);
  });

  test('getMemoryInfo parses /proc/meminfo correctly', async () => {
    const mockMemInfo = `MemTotal:       16000000 kB
MemFree:         4000000 kB
MemAvailable:   10000000 kB
Buffers:          500000 kB
Cached:          5500000 kB
SwapTotal:       4000000 kB
SwapFree:        3000000 kB`;

    mockProcReader.safeReadFile.mockResolvedValueOnce(mockMemInfo);
    const result = await memoryService.getMemoryInfo();

    expect(result.memory.totalBytes).toBe(16000000 * 1024);
    expect(result.memory.availableBytes).toBe(10000000 * 1024);
    expect(result.memory.usedBytes).toBe(6000000 * 1024);
    expect(result.memory.usagePercent).toBe(37.5);
    expect(result.swap.totalBytes).toBe(4000000 * 1024);
    expect(result.swap.usedBytes).toBe(1000000 * 1024);
    expect(result.swap.usagePercent).toBe(25);
  });
});
