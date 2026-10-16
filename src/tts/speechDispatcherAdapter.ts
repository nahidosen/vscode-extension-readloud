import { EngineSpeakOptions, VoiceOption } from '../types';
import { BaseAdapter } from './baseAdapter';
import { commandExists, readCommandOutput } from './processUtils';
import { spawnSync } from 'child_process';
import { ENGINE_VALUES, SIGNED_PERCENT, TTS_ARGS, TTS_BINARIES } from '../constants';

function mapSignedPercent(value: number): number {
  return Math.round((value - SIGNED_PERCENT.MIDPOINT) * SIGNED_PERCENT.MULTIPLIER);
}

export class SpeechDispatcherAdapter extends BaseAdapter {
  public readonly id = ENGINE_VALUES.SPEECH_DISPATCHER;
  public readonly displayName = 'Speech Dispatcher';

  public async isAvailable(): Promise<boolean> {
    return commandExists(TTS_BINARIES.SPEECH_DISPATCHER);
  }

  protected commandName(): string {
    return TTS_BINARIES.SPEECH_DISPATCHER;
  }

  public async listVoices(): Promise<VoiceOption[]> {
    const output = readCommandOutput(TTS_BINARIES.SPEECH_DISPATCHER, [TTS_ARGS.SPEECH_DISPATCHER_LIST_VOICES]);
    if (!output) {
      return [];
    }

    const lines = output.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 0);
    const voices: VoiceOption[] = [];

    for (const line of lines) {
      // Typical outputs vary by backend; keep parser permissive.
      const cols = line.split(/\s{2,}/).filter(Boolean);
      if (cols.length === 0) {
        continue;
      }

      const id = cols[0].split(/\s+/)[0];
      if (!id) {
        continue;
      }

      voices.push({
        id,
        label: line,
        detail: `voice id: ${id}`
      });
    }

    return dedupeById(voices);
  }

  protected buildArgs(text: string, options: EngineSpeakOptions): string[] {
    const args = [
      TTS_ARGS.SPEECH_DISPATCHER_WAIT,
      TTS_ARGS.SPEECH_DISPATCHER_RATE,
      String(mapSignedPercent(options.rate)),
      TTS_ARGS.SPEECH_DISPATCHER_PITCH,
      String(mapSignedPercent(options.pitch)),
      TTS_ARGS.SPEECH_DISPATCHER_VOLUME,
      String(mapSignedPercent(options.volume))
    ];

    if (options.voiceLanguage.trim().length > 0) {
      args.push(TTS_ARGS.SPEECH_DISPATCHER_LANGUAGE, options.voiceLanguage.trim());
    }

    if (options.speechDispatcherVoiceType.trim().length > 0) {
      args.push(TTS_ARGS.SPEECH_DISPATCHER_VOICE_TYPE, options.speechDispatcherVoiceType.trim());
    }

    if (options.voice.trim().length > 0) {
      args.push(TTS_ARGS.SPEECH_DISPATCHER_VOICE, options.voice.trim());
    }

    args.push(text);
    return args;
  }

  public async stop(): Promise<void> {
    await super.stop();

    // speech-dispatcher may keep speaking queued text after client process ends.
    // Issue explicit stop/cancel commands to flush current and queued utterances.
    spawnSync(TTS_BINARIES.SPEECH_DISPATCHER, [TTS_ARGS.SPEECH_DISPATCHER_STOP], { stdio: 'ignore' });
    spawnSync(TTS_BINARIES.SPEECH_DISPATCHER, [TTS_ARGS.SPEECH_DISPATCHER_CANCEL], { stdio: 'ignore' });
  }
}

function dedupeById(items: VoiceOption[]): VoiceOption[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}
