import { EngineSpeakOptions } from '../types';
import { BaseAdapter } from './baseAdapter';
import { commandExists } from './processUtils';

function mapSignedPercent(value: number): number {
  return Math.round((value - 50) * 2);
}

export class SpeechDispatcherAdapter extends BaseAdapter {
  public readonly id = 'speechDispatcher' as const;
  public readonly displayName = 'Speech Dispatcher';

  public async isAvailable(): Promise<boolean> {
    return commandExists('spd-say');
  }

  protected commandName(): string {
    return 'spd-say';
  }

  protected buildArgs(text: string, options: EngineSpeakOptions): string[] {
    const args = [
      '-w',
      '-r',
      String(mapSignedPercent(options.rate)),
      '-p',
      String(mapSignedPercent(options.pitch)),
      '-i',
      String(mapSignedPercent(options.volume))
    ];

    if (options.voice.trim().length > 0) {
      args.push('-y', options.voice.trim());
    }

    args.push(text);
    return args;
  }
}
