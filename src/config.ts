import * as vscode from 'vscode';
import { READLOUD_DEFAULTS, READLOUD_LIMITS, READLOUD_SECTION, READLOUD_SETTINGS } from './constants';
import { EngineSetting, ReadLoudConfig, SpeechDispatcherVoiceType } from './types';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function quantize(value: number, step: number): number {
  const decimals = (step.toString().split('.')[1] ?? '').length;
  const quantized = Math.round(value / step) * step;
  return Number(quantized.toFixed(decimals));
}

function normalizedRateToMultiplier(rate: number): number {
  const clampedRate = clamp(rate, READLOUD_LIMITS.RATE_MIN, READLOUD_LIMITS.RATE_MAX);
  if (clampedRate <= READLOUD_LIMITS.RATE_MID) {
    return (
      READLOUD_LIMITS.SPEED_MIN +
      (clampedRate / READLOUD_LIMITS.RATE_MID) * (READLOUD_LIMITS.SPEED_MID - READLOUD_LIMITS.SPEED_MIN)
    );
  }
  return (
    READLOUD_LIMITS.SPEED_MID +
    ((clampedRate - READLOUD_LIMITS.RATE_MID) / READLOUD_LIMITS.RATE_MID) *
      (READLOUD_LIMITS.SPEED_MAX - READLOUD_LIMITS.SPEED_MID)
  );
}

function multiplierToNormalizedRate(multiplier: number): number {
  const clamped = clamp(multiplier, READLOUD_LIMITS.SPEED_MIN, READLOUD_LIMITS.SPEED_MAX);
  if (clamped <= READLOUD_LIMITS.SPEED_MID) {
    return (
      ((clamped - READLOUD_LIMITS.SPEED_MIN) / (READLOUD_LIMITS.SPEED_MID - READLOUD_LIMITS.SPEED_MIN)) *
      READLOUD_LIMITS.RATE_MID
    );
  }
  return (
    READLOUD_LIMITS.RATE_MID +
    ((clamped - READLOUD_LIMITS.SPEED_MID) / (READLOUD_LIMITS.SPEED_MAX - READLOUD_LIMITS.SPEED_MID)) *
      READLOUD_LIMITS.RATE_MID
  );
}

export function getReadLoudConfig(): ReadLoudConfig {
  const cfg = vscode.workspace.getConfiguration(READLOUD_SECTION);
  const legacyRate = clamp(
    cfg.get<number>(READLOUD_SETTINGS.RATE, READLOUD_DEFAULTS.RATE),
    READLOUD_LIMITS.RATE_MIN,
    READLOUD_LIMITS.RATE_MAX
  );
  const speedMultiplier = clamp(
    quantize(
      cfg.get<number>(READLOUD_SETTINGS.SPEED_MULTIPLIER, normalizedRateToMultiplier(legacyRate)),
      READLOUD_LIMITS.SPEED_STEP
    ),
    READLOUD_LIMITS.SPEED_MIN,
    READLOUD_LIMITS.SPEED_MAX
  );
  return {
    engine: cfg.get<EngineSetting>(READLOUD_SETTINGS.ENGINE, READLOUD_DEFAULTS.ENGINE),
    voice: cfg.get<string>(READLOUD_SETTINGS.VOICE, READLOUD_DEFAULTS.VOICE),
    voiceLanguage: cfg.get<string>(READLOUD_SETTINGS.VOICE_LANGUAGE, READLOUD_DEFAULTS.VOICE_LANGUAGE),
    speechDispatcherVoiceType: cfg.get<SpeechDispatcherVoiceType>(
      READLOUD_SETTINGS.SPEECH_DISPATCHER_VOICE_TYPE,
      READLOUD_DEFAULTS.SPEECH_DISPATCHER_VOICE_TYPE
    ),
    speedMultiplier,
    rate: clamp(multiplierToNormalizedRate(speedMultiplier), READLOUD_LIMITS.RATE_MIN, READLOUD_LIMITS.RATE_MAX),
    pitch: clamp(
      cfg.get<number>(READLOUD_SETTINGS.PITCH, READLOUD_DEFAULTS.PITCH),
      READLOUD_LIMITS.RATE_MIN,
      READLOUD_LIMITS.RATE_MAX
    ),
    volume: clamp(
      quantize(cfg.get<number>(READLOUD_SETTINGS.VOLUME, READLOUD_DEFAULTS.VOLUME), READLOUD_LIMITS.VOLUME_STEP),
      READLOUD_LIMITS.VOLUME_MIN,
      READLOUD_LIMITS.VOLUME_MAX
    ),
    showStatusBar: cfg.get<boolean>(READLOUD_SETTINGS.SHOW_STATUS_BAR, READLOUD_DEFAULTS.SHOW_STATUS_BAR),
    autoScroll: cfg.get<boolean>(READLOUD_SETTINGS.AUTO_SCROLL, READLOUD_DEFAULTS.AUTO_SCROLL),
    syncBaseWpm: clamp(
      cfg.get<number>(READLOUD_SETTINGS.SYNC_BASE_WPM, READLOUD_DEFAULTS.SYNC_BASE_WPM),
      READLOUD_LIMITS.SYNC_BASE_WPM_MIN,
      READLOUD_LIMITS.SYNC_BASE_WPM_MAX
    ),
    highlight: {
      wordColor: cfg.get<string>(READLOUD_SETTINGS.HIGHLIGHT_WORD_COLOR, READLOUD_DEFAULTS.HIGHLIGHT_WORD_COLOR),
      sentenceColor: cfg.get<string>(
        READLOUD_SETTINGS.HIGHLIGHT_SENTENCE_COLOR,
        READLOUD_DEFAULTS.HIGHLIGHT_SENTENCE_COLOR
      ),
      lineColor: cfg.get<string>(READLOUD_SETTINGS.HIGHLIGHT_LINE_COLOR, READLOUD_DEFAULTS.HIGHLIGHT_LINE_COLOR)
    }
  };
}
