import * as vscode from 'vscode';

export type EngineSetting = 'auto' | 'espeak' | 'speechDispatcher';
export type ResolvedEngine = 'espeak' | 'speechDispatcher';

export type PlaybackState = 'idle' | 'playing' | 'paused' | 'stopping';

export interface HighlightColors {
  wordColor: string;
  sentenceColor: string;
  lineColor: string;
}

export interface ReadLoudConfig {
  engine: EngineSetting;
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
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
  rate: number;
  pitch: number;
  volume: number;
  signal: AbortSignal;
}

export interface TtsEngineAdapter {
  readonly id: ResolvedEngine;
  readonly displayName: string;
  readonly canPauseResume: boolean;
  isAvailable(): Promise<boolean>;
  speakSentence(text: string, options: EngineSpeakOptions): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<void>;
}
