import { ChildProcess, spawn, spawnSync } from 'child_process';

export function commandExists(binary: string): boolean {
  const result = spawnSync(binary, ['--version'], {
    stdio: ['ignore', 'ignore', 'ignore']
  });
  if (result.status === 0) {
    return true;
  }

  // Some commands return non-zero for --version but still exist.
  return result.error === undefined;
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

export function readCommandOutput(command: string, args: string[]): string {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore']
  });

  if (result.error || result.status !== 0 || typeof result.stdout !== 'string') {
    return '';
  }

  return result.stdout;
}
