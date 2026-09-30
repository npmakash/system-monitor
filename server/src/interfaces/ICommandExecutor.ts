export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface ICommandExecutor {
  execute(command: string, args: string[]): Promise<ExecResult>;
}
