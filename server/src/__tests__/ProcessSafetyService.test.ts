import { ProcessSafetyService } from '../services/ProcessSafetyService';

describe('ProcessSafetyService', () => {
  let safetyService: ProcessSafetyService;

  beforeEach(() => {
    safetyService = new ProcessSafetyService();
  });

  test('blocks PID <= 10 from termination', () => {
    const val1 = safetyService.validateProcessAction(1, 'systemd');
    expect(val1.isSafe).toBe(false);
    expect(val1.reason).toContain('PID 1 <= 10');

    const val5 = safetyService.validateProcessAction(5, 'kthreadd');
    expect(val5.isSafe).toBe(false);
  });

  test('blocks current backend agent process PID', () => {
    const val = safetyService.validateProcessAction(process.pid, 'node');
    expect(val.isSafe).toBe(false);
    expect(val.reason).toContain('backend agent process');
  });

  test('blocks critical system processes by name', () => {
    const valGnome = safetyService.validateProcessAction(1500, 'gnome-shell');
    expect(valGnome.isSafe).toBe(false);
    expect(valGnome.reason).toContain('protected core system process');

    const valXorg = safetyService.validateProcessAction(1200, 'Xorg');
    expect(valXorg.isSafe).toBe(false);
  });

  test('allows non-critical user processes', () => {
    const valUserApp = safetyService.validateProcessAction(9999, 'my-custom-app');
    expect(valUserApp.isSafe).toBe(true);
    expect(valUserApp.reason).toBeUndefined();
  });

  test('validates allowed kill signal names', () => {
    const valInvalidSig = safetyService.validateProcessAction(9999, 'app', 'SIGINVALID');
    expect(valInvalidSig.isSafe).toBe(false);
    expect(valInvalidSig.reason).toContain('Invalid signal type');

    const valValidSig = safetyService.validateProcessAction(9999, 'app', 'SIGKILL');
    expect(valValidSig.isSafe).toBe(true);
  });
});
