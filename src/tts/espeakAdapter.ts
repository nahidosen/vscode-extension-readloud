import { EngineSpeakOptions } from '../types';
import { BaseAdapter } from './baseAdapter';
import { commandExists } from './processUtils';

function mapRate(rate: number): number {
  // espeak-ng speed range roughly 80-450 WPM.
  return Math.round(80 + (rate / 100) * 300);
}

function mapPitch(pitch: number): number {
  // espeak-ng pitch range 0-99.
  return Math.round((pitch / 100) * 99);
}

function mapVolume(volume: number): number {
  // espeak-ng amplitude range 0-200.
  return Math.round((volume / 100) * 200);
}

export class EspeakAdapter extends BaseAdapter {
  public readonly id = 'espeak' as const;
  public readonly displayName = 'eSpeak NG';

  public async isAvailable(): Promise<boolean> {
    return commandExists('espeak-ng');
  }

  protected commandName(): string {
    return 'espeak-ng';
  }

  protected buildArgs(text: string, options: EngineSpeakOptions): string[] {
    const args = [
      '-s',
      String(mapRate(options.rate)),
      '-p',
      String(mapPitch(options.pitch)),
      '-a',
      String(mapVolume(options.volume))
    ];

    if (options.voice.trim().length > 0) {
      args.push('-v', options.voice.trim());
    }

    args.push(text);
    return args;
  }
}
