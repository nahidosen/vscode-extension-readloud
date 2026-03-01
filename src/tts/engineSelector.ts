import { ENGINE_VALUES, SUPPORTED_PLATFORM_LABEL, TTS_BINARIES } from '../constants';
import { EngineSetting, TtsEngineAdapter } from '../types';

export interface EngineSelectionResult {
  adapter: TtsEngineAdapter | undefined;
  reason: string;
}

export async function selectEngine(
  setting: EngineSetting,
  adapters: TtsEngineAdapter[]
): Promise<EngineSelectionResult> {
  const availability = await Promise.all(
    adapters.map(async (adapter) => ({
      adapter,
      available: await adapter.isAvailable()
    }))
  );

  const availableAdapters = availability.filter((entry) => entry.available).map((entry) => entry.adapter);

  if (setting !== ENGINE_VALUES.AUTO) {
    const exact = availableAdapters.find((adapter) => adapter.id === setting);
    if (exact) {
      return {
        adapter: exact,
        reason: `Using configured engine: ${exact.displayName}.`
      };
    }

    if (availableAdapters.length > 0) {
      return {
        adapter: availableAdapters[0],
        reason: `Configured engine '${setting}' unavailable, falling back to ${availableAdapters[0].displayName}.`
      };
    }

    return {
      adapter: undefined,
      reason: `Configured engine '${setting}' is unavailable and no fallback engines were found.`
    };
  }

  if (availableAdapters.length > 0) {
    return {
      adapter: availableAdapters[0],
      reason: `Using auto-selected engine: ${availableAdapters[0].displayName}.`
    };
  }

  return {
    adapter: undefined,
    reason: `No supported speech engine found. Install ${TTS_BINARIES.ESPEAK} or ${TTS_BINARIES.SPEECH_DISPATCHER} on ${SUPPORTED_PLATFORM_LABEL}.`
  };
}
