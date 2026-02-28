import * as vscode from 'vscode';
import { ReadLoudConfig } from './types';

const SECTION = 'readLoud';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function getReadLoudConfig(): ReadLoudConfig {
  const cfg = vscode.workspace.getConfiguration(SECTION);
  return {
    engine: cfg.get<'auto' | 'espeak' | 'speechDispatcher'>('engine', 'auto'),
    voice: cfg.get<string>('voice', ''),
    rate: clamp(cfg.get<number>('rate', 50), 0, 100),
    pitch: clamp(cfg.get<number>('pitch', 50), 0, 100),
    volume: clamp(cfg.get<number>('volume', 100), 0, 100),
    autoScroll: cfg.get<boolean>('autoScroll', true),
    syncBaseWpm: clamp(cfg.get<number>('sync.baseWPM', 180), 80, 320),
    highlight: {
      wordColor: cfg.get<string>('highlight.wordColor', 'rgba(255, 170, 0, 0.45)'),
      sentenceColor: cfg.get<string>('highlight.sentenceColor', 'rgba(0, 170, 255, 0.20)'),
      lineColor: cfg.get<string>('highlight.lineColor', 'rgba(0, 255, 140, 0.12)')
    }
  };
}

export const READLOUD_SECTION = SECTION;
