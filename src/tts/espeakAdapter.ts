import { ENGINE_VALUES, ESPEAK_LIMITS, TTS_ARGS, TTS_BINARIES } from '../constants';
import { EngineSpeakOptions, VoiceOption } from '../types';
import { BaseAdapter } from './baseAdapter';
import { commandExists, readCommandOutput } from './processUtils';

function mapRate(rate: number): number {
  // espeak-ng speed range roughly 80-450 WPM.
  return Math.round(ESPEAK_LIMITS.MIN_WPM + (rate / 100) * ESPEAK_LIMITS.WPM_SPAN);
}

function mapPitch(pitch: number): number {
  // espeak-ng pitch range 0-99.
  return Math.round((pitch / 100) * ESPEAK_LIMITS.PITCH_MAX);
}

function mapVolume(volume: number): number {
  // espeak-ng amplitude range 0-200.
  return Math.round((volume / 100) * ESPEAK_LIMITS.AMPLITUDE_MAX);
}

export class EspeakAdapter extends BaseAdapter {
  public readonly id = ENGINE_VALUES.ESPEAK;
  public readonly displayName = 'eSpeak NG';

  public async isAvailable(): Promise<boolean> {
    return commandExists(TTS_BINARIES.ESPEAK);
  }

  protected commandName(): string {
    return TTS_BINARIES.ESPEAK;
  }

  public async listVoices(): Promise<VoiceOption[]> {
    const output = readCommandOutput(TTS_BINARIES.ESPEAK, [TTS_ARGS.ESPEAK_LIST_VOICES]);
    if (!output) {
      return [];
    }

    const lines = output.split(/\r?\n/).slice(1);
    const seen = new Set<string>();
    const voices: VoiceOption[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        continue;
      }

      const parts = line.split(/\s+/);
      if (parts.length < 5) {
        continue;
      }

      const id = parts[1];
      if (!id || seen.has(id)) {
        continue;
      }
      seen.add(id);

      const language = parts[1];
      const voiceName = parts[3] ?? id;
      const voicePackage = parts[4] ?? '';
      const otherLangs = parts.slice(5).join(' ');
      voices.push({
        id,
        label: voiceName,
        detail: [voicePackage, `code: ${language}`, otherLangs].filter((part) => part.length > 0).join(' | ')
      });
    }

    return voices;
  }

  protected buildArgs(text: string, options: EngineSpeakOptions): string[] {
    const args = [
      TTS_ARGS.ESPEAK_SPEED,
      String(mapRate(options.rate)),
      TTS_ARGS.ESPEAK_PITCH,
      String(mapPitch(options.pitch)),
      TTS_ARGS.ESPEAK_AMPLITUDE,
      String(mapVolume(options.volume))
    ];

    if (options.voice.trim().length > 0) {
      args.push(TTS_ARGS.ESPEAK_VOICE, options.voice.trim());
    } else if (options.voiceLanguage.trim().length > 0) {
      args.push(TTS_ARGS.ESPEAK_VOICE, options.voiceLanguage.trim());
    }

    args.push(text);
    return args;
  }
}
