import { execFile } from 'child_process';
import { promisify } from 'util';
import { ICommandExecutor, ExecResult } from '../interfaces/ICommandExecutor';
import { Logger } from '../utils/Logger';

const execFileAsync = promisify(execFile);

export class CommandExecutor implements ICommandExecutor {
  /**
   * Executes a binary with arguments using execFile (without shell shell-injection risks)
   */
  public async execute(command: string, args: string[] = []): Promise<ExecResult> {
    try {
      const { stdout, stderr } = await execFileAsync(command, args, { maxBuffer: 1024 * 1024 * 5 });
      return {
        stdout: stdout.toString(),
        stderr: stderr.toString(),
        exitCode: 0,
      };
    } catch (error: any) {
      Logger.warn('CommandExecutor', `Command '${command} ${args.join(' ')}' exited with error: ${error.message}`);
      return {
        stdout: error.stdout ? error.stdout.toString() : '',
        stderr: error.stderr ? error.stderr.toString() : error.message,
        exitCode: error.code || 1,
      };
    }
  }
}
