import { ChildProcess, spawn, spawnSync } from 'child_process';

export function commandExists(binary: string): boolean {
  const result = spawnSync('sh', ['-c', `command -v ${binary}`], {
    stdio: 'ignore'
  });
  return result.status === 0;
}

export function spawnSpeechProcess(command: string, args: string[]): ChildProcess {
  return spawn(command, args, {
    stdio: ['ignore', 'ignore', 'pipe']
  });
}

export function killProcess(processRef: ChildProcess | undefined): void {
  if (!processRef || processRef.killed) {
    return;
  }

  try {
    processRef.kill('SIGTERM');
  } catch {
    // Best effort kill.
  }
}
