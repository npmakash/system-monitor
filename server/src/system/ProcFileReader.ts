import fs from 'fs/promises';
import { Logger } from '../utils/Logger';

export class ProcFileReader {
  /**
   * Asynchronously reads content from a given file path (e.g. /proc/stat, /proc/meminfo)
   */
  public async readFile(filePath: string): Promise<string> {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return data;
    } catch (error: any) {
      Logger.error('ProcFileReader', `Failed to read file ${filePath}: ${error.message}`);
      throw new Error(`Unable to read system file: ${filePath}`);
    }
  }

  /**
   * Safely attempts to read file, returning fallback string if file does not exist or fails
   */
  public async safeReadFile(filePath: string, fallback: string = ''): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch {
      return fallback;
    }
  }
}
