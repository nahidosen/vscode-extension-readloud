import * as vscode from 'vscode';
import { ENGINE_SETTINGS, RESOLVED_ENGINES, SPEECH_DISPATCHER_VOICE_TYPES } from './constants';

export type EngineSetting = (typeof ENGINE_SETTINGS)[number];
export type ResolvedEngine = (typeof RESOLVED_ENGINES)[number];
export type SpeechDispatcherVoiceType = (typeof SPEECH_DISPATCHER_VOICE_TYPES)[number];

export type PlaybackState = 'idle' | 'playing' | 'paused' | 'stopping';

export interface HighlightColors {
  wordColor: string;
  sentenceColor: string;
  lineColor: string;
}

export interface ReadLoudConfig {
  engine: EngineSetting;
  voice: string;
  voiceLanguage: string;
  speechDispatcherVoiceType: SpeechDispatcherVoiceType;
  speedMultiplier: number;
  rate: number;
  pitch: number;
  volume: number;
  showStatusBar: boolean;
  autoScroll: boolean;
  syncBaseWpm: number;
  highlight: HighlightColors;
}

export interface WordToken {
  text: string;
  range: vscode.Range;
}

export interface SentenceUnit {
  text: string;
  range: vscode.Range;
  lineRange: vscode.Range;
  line: number;
  words: WordToken[];
}

export interface EngineSpeakOptions {
  voice: string;
  voiceLanguage: string;
  speechDispatcherVoiceType: SpeechDispatcherVoiceType;
  rate: number;
  pitch: number;
  volume: number;
  signal: AbortSignal;
}

export interface VoiceOption {
  id: string;
  label: string;
  detail?: string;
}

export interface TtsEngineAdapter {
  readonly id: ResolvedEngine;
  readonly displayName: string;
  readonly canPauseResume: boolean;
  isAvailable(): Promise<boolean>;
  listVoices(): Promise<VoiceOption[]>;
  speakSentence(text: string, options: EngineSpeakOptions): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<void>;
}
