import { CpuService } from '../services/CpuService';
import { ProcFileReader } from '../system/ProcFileReader';

describe('CpuService', () => {
  let mockProcReader: jest.Mocked<ProcFileReader>;
  let cpuService: CpuService;

  beforeEach(() => {
    mockProcReader = {
      readFile: jest.fn(),
      safeReadFile: jest.fn(),
    } as any;
    cpuService = new CpuService(mockProcReader);
  });

  test('getCpuInfo returns CpuInfo object when proc stat is read', async () => {
    const mockStatFirst = `cpu  1000 200 300 5000 100 10 20 0
cpu0 500 100 150 2500 50 5 10 0
cpu1 500 100 150 2500 50 5 10 0`;

    const mockStatSecond = `cpu  2000 400 600 6000 200 20 40 0
cpu0 1000 200 300 3000 100 10 20 0
cpu1 1000 200 300 3000 100 10 20 0`;

    mockProcReader.safeReadFile.mockResolvedValueOnce(mockStatFirst);
    const cpu1 = await cpuService.getCpuInfo();
    expect(cpu1.usagePercent).toBe(0);

    mockProcReader.safeReadFile.mockResolvedValueOnce(mockStatSecond);
    const cpu2 = await cpuService.getCpuInfo();
    expect(cpu2.cores).toBeGreaterThan(0);
    expect(cpu2.usagePercent).toBeGreaterThan(0);
  });
});
