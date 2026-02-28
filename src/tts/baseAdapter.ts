import { ChildProcess } from 'child_process';
import { EngineSpeakOptions, TtsEngineAdapter } from '../types';
import { killProcess, spawnSpeechProcess } from './processUtils';

export abstract class BaseAdapter implements TtsEngineAdapter {
  public abstract readonly id: 'espeak' | 'speechDispatcher';
  public abstract readonly displayName: string;
  public readonly canPauseResume = false;

  protected currentProcess: ChildProcess | undefined;

  protected abstract buildArgs(text: string, options: EngineSpeakOptions): string[];
  protected abstract commandName(): string;
  public abstract isAvailable(): Promise<boolean>;

  public async speakSentence(text: string, options: EngineSpeakOptions): Promise<void> {
    await this.stop();

    const args = this.buildArgs(text, options);
    const processRef = spawnSpeechProcess(this.commandName(), args);
    this.currentProcess = processRef;

    const signalListener = (): void => {
      killProcess(processRef);
    };
    options.signal.addEventListener('abort', signalListener, { once: true });

    await new Promise<void>((resolve, reject) => {
      processRef.on('error', (error) => {
        reject(error);
      });

      processRef.stderr?.on('data', (chunk: Buffer) => {
        const stderr = chunk.toString().trim();
        if (stderr.length > 0) {
          // Keep stderr ignored for now, process exit code remains source of truth.
        }
      });

      processRef.on('exit', (code, signal) => {
        if (signal === 'SIGTERM' || options.signal.aborted) {
          resolve();
          return;
        }

        if (code === 0 || code === null) {
          resolve();
          return;
        }

        reject(new Error(`${this.displayName} exited with code ${code}`));
      });
    }).finally(() => {
      options.signal.removeEventListener('abort', signalListener);
      if (this.currentProcess === processRef) {
        this.currentProcess = undefined;
      }
    });
  }

  public async pause(): Promise<void> {
    await this.stop();
  }

  public async resume(): Promise<void> {
    return;
  }

  public async stop(): Promise<void> {
    if (!this.currentProcess) {
      return;
    }

    const processRef = this.currentProcess;
    killProcess(processRef);
    this.currentProcess = undefined;
  }
}
