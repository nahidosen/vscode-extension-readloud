import { READLOUD_LIMITS, TIMING_LIMITS, TIMING_REGEX } from './constants';
import { WordToken } from './types';

function countWords(text: string): number {
  const matches = text.match(new RegExp(TIMING_REGEX.WORD.source, TIMING_REGEX.WORD.flags));
  return matches ? matches.length : 0;
}

export function estimateSentenceDurationMs(sentence: string, baseWpm: number): number {
  const safeWpm = Math.min(READLOUD_LIMITS.SYNC_BASE_WPM_MAX, Math.max(READLOUD_LIMITS.SYNC_BASE_WPM_MIN, baseWpm));
  const wordCount = Math.max(1, countWords(sentence));
  const estimated = (wordCount / safeWpm) * 60_000;
  return Math.max(TIMING_LIMITS.MIN_SENTENCE_DURATION_MS, Math.round(estimated));
}

export function estimateWordDurations(words: WordToken[], sentenceDurationMs: number): number[] {
  if (words.length === 0) {
    return [];
  }

  const minDurationForWords = words.length * TIMING_LIMITS.MIN_WORD_DURATION_MS;
  const safeDuration = Math.max(minDurationForWords, Math.round(sentenceDurationMs));
  const weights = words.map((word) => Math.max(1, word.text.length / 4));
  const totalWeight = weights.reduce((acc, value) => acc + value, 0);

  const raw = weights.map((weight) =>
    Math.max(TIMING_LIMITS.MIN_WORD_DURATION_MS, Math.round((weight / totalWeight) * safeDuration))
  );
  const totalRaw = raw.reduce((acc, value) => acc + value, 0);

  if (totalRaw === safeDuration) {
    return raw;
  }

  const adjusted = [...raw];
  const delta = safeDuration - totalRaw;
  const step = delta > 0 ? 1 : -1;
  let remaining = Math.abs(delta);
  let index = 0;

  while (remaining > 0) {
    const i = index % adjusted.length;
    if (step < 0 && adjusted[i] <= TIMING_LIMITS.MIN_WORD_DURATION_MS) {
      index += 1;
      continue;
    }

    adjusted[i] += step;
    remaining -= 1;
    index += 1;
  }

  return adjusted;
}
