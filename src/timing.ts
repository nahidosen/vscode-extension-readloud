import { WordToken } from './types';

const MIN_SENTENCE_DURATION_MS = 350;
const MIN_WORD_DURATION_MS = 60;

function countWords(text: string): number {
  const matches = text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu);
  return matches ? matches.length : 0;
}

export function estimateSentenceDurationMs(sentence: string, baseWpm: number): number {
  const safeWpm = Math.min(320, Math.max(80, baseWpm));
  const wordCount = Math.max(1, countWords(sentence));
  const estimated = (wordCount / safeWpm) * 60_000;
  return Math.max(MIN_SENTENCE_DURATION_MS, Math.round(estimated));
}

export function estimateWordDurations(words: WordToken[], sentenceDurationMs: number): number[] {
  if (words.length === 0) {
    return [];
  }

  const safeDuration = Math.max(MIN_SENTENCE_DURATION_MS, sentenceDurationMs);
  const weights = words.map((word) => Math.max(1, word.text.length / 4));
  const totalWeight = weights.reduce((acc, value) => acc + value, 0);

  const raw = weights.map((weight) => Math.max(MIN_WORD_DURATION_MS, Math.round((weight / totalWeight) * safeDuration)));
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
    if (step < 0 && adjusted[i] <= MIN_WORD_DURATION_MS) {
      index += 1;
      continue;
    }

    adjusted[i] += step;
    remaining -= 1;
    index += 1;
  }

  return adjusted;
}
