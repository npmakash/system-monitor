import { Formatter } from '../utils/Formatter';

describe('Formatter Utility', () => {
  test('bytesToGB converts bytes to gigabytes correctly', () => {
    expect(Formatter.bytesToGB(1073741824)).toBe(1);
    expect(Formatter.bytesToGB(5368709120)).toBe(5);
    expect(Formatter.bytesToGB(0)).toBe(0);
  });

  test('bytesToFormattedSpeed formats network throughput speeds', () => {
    expect(Formatter.bytesToFormattedSpeed(500)).toBe('500 B/s');
    expect(Formatter.bytesToFormattedSpeed(2048)).toBe('2.0 KB/s');
    expect(Formatter.bytesToFormattedSpeed(5242880)).toBe('5.0 MB/s');
    expect(Formatter.bytesToFormattedSpeed(2147483648)).toBe('2.00 GB/s');
  });

  test('formatUptime formats seconds into readable duration', () => {
    expect(Formatter.formatUptime(90)).toBe('1m');
    expect(Formatter.formatUptime(3660)).toBe('1h 1m');
    expect(Formatter.formatUptime(90060)).toBe('1d 1h 1m');
  });

  test('toPercentage clamps and rounds percentage values', () => {
    expect(Formatter.toPercentage(45.678)).toBe(45.7);
    expect(Formatter.toPercentage(-10)).toBe(0);
    expect(Formatter.toPercentage(150)).toBe(100);
    expect(Formatter.toPercentage(NaN)).toBe(0);
  });
});
