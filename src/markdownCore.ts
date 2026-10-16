import { MARKDOWN_REGEX, TIMING_REGEX } from './constants';

export interface ProseLine {
  line: number;
  startCol: number;
  text: string;
  rawLength: number;
}

export interface SentenceSpan {
  start: number;
  end: number;
}

export interface WordSpan {
  start: number;
  end: number;
  text: string;
}

export function extractVisibleProseLines(markdown: string): ProseLine[] {
  const lines = markdown.split(/\r?\n/);
  const results: ProseLine[] = [];

  let inFrontMatter = false;
  let frontMatterHandled = false;
  let inFence = false;
  let inHtmlBlock = false;
  let inHtmlComment = false;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const raw = lines[lineIndex];
    const trimmed = raw.trim();

    if (!frontMatterHandled && lineIndex === 0 && trimmed === '---') {
      inFrontMatter = true;
      continue;
    }

    if (inFrontMatter) {
      if (trimmed === '---' || trimmed === '...') {
        inFrontMatter = false;
        frontMatterHandled = true;
      }
      continue;
    }

    if (MARKDOWN_REGEX.FENCE.test(trimmed)) {
      inFence = !inFence;
      continue;
    }

    if (inFence) {
      continue;
    }

    if (trimmed.startsWith('<!--')) {
      inHtmlComment = true;
    }

    if (inHtmlComment) {
      if (trimmed.endsWith('-->')) {
        inHtmlComment = false;
      }
      continue;
    }

    if (!inHtmlBlock && MARKDOWN_REGEX.HTML_BLOCK_START.test(trimmed) && !trimmed.endsWith('/>')) {
      inHtmlBlock = true;
      continue;
    }

    if (inHtmlBlock) {
      if (MARKDOWN_REGEX.HTML_BLOCK_END.test(trimmed)) {
        inHtmlBlock = false;
      }
      continue;
    }

    if (trimmed.length === 0) {
      continue;
    }

    if (isTableLine(trimmed)) {
      continue;
    }

    const normalized = normalizeProseLine(raw);
    if (!normalized) {
      continue;
    }

    results.push({
      line: lineIndex,
      startCol: normalized.startCol,
      text: normalized.text,
      rawLength: raw.length
    });
  }

  return results;
}

export function sentenceSpans(text: string): SentenceSpan[] {
  if (text.trim().length === 0) {
    return [];
  }

  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter !== 'undefined') {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'sentence' });
    const spans: SentenceSpan[] = [];
    for (const part of segmenter.segment(text)) {
      const rawStart = part.index;
      const rawEnd = rawStart + part.segment.length;
      const start = trimLeading(text, rawStart, rawEnd);
      const end = trimTrailing(text, start, rawEnd);
      if (start < end) {
        spans.push({ start, end });
      }
    }

    if (spans.length > 0) {
      return spans;
    }
  }

  const fallback: SentenceSpan[] = [];
  const regex = new RegExp(MARKDOWN_REGEX.SENTENCE_FALLBACK.source, MARKDOWN_REGEX.SENTENCE_FALLBACK.flags);
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const rawStart = match.index;
    const rawEnd = rawStart + match[0].length;
    const start = trimLeading(text, rawStart, rawEnd);
    const end = trimTrailing(text, start, rawEnd);
    if (start < end) {
      fallback.push({ start, end });
    }
  }

  return fallback;
}

export function extractWordSpans(text: string): WordSpan[] {
  const spans: WordSpan[] = [];
  const regex = new RegExp(TIMING_REGEX.WORD.source, TIMING_REGEX.WORD.flags);
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    spans.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[0]
    });
  }
  return spans;
}

function normalizeProseLine(raw: string): { startCol: number; text: string } | undefined {
  let working = raw;
  let offset = 0;

  const quoteMatch = working.match(/^(\s*>+\s*)+/);
  if (quoteMatch) {
    offset += quoteMatch[0].length;
    working = working.slice(quoteMatch[0].length);
  }

  const headingMatch = working.match(/^\s{0,3}#{1,6}\s+(.*)$/);
  if (headingMatch) {
    const prefixLength = headingMatch[0].length - headingMatch[1].length;
    offset += prefixLength;
    working = headingMatch[1];
  } else {
    const listMatch = working.match(/^\s{0,3}(?:[-*+]\s+|\d+[.)]\s+)(.*)$/);
    if (listMatch) {
      const prefixLength = listMatch[0].length - listMatch[1].length;
      offset += prefixLength;
      working = listMatch[1];
    }

    const taskMatch = working.match(/^\[(?: |x|X)\]\s+(.*)$/);
    if (taskMatch) {
      const prefixLength = taskMatch[0].length - taskMatch[1].length;
      offset += prefixLength;
      working = taskMatch[1];
    }
  }

  const trimmedStart = working.trimStart();
  offset += working.length - trimmedStart.length;

  const text = trimmedStart.trimEnd();
  if (text.length === 0) {
    return undefined;
  }

  return {
    startCol: offset,
    text
  };
}

function isTableLine(trimmed: string): boolean {
  if (MARKDOWN_REGEX.TABLE_SEPARATOR.test(trimmed)) {
    return true;
  }

  const pipeCount = (trimmed.match(/\|/g) || []).length;
  if (pipeCount >= 2 && (trimmed.startsWith('|') || trimmed.endsWith('|'))) {
    return true;
  }

  return false;
}

function trimLeading(text: string, start: number, end: number): number {
  let index = start;
  while (index < end && /\s/.test(text[index])) {
    index += 1;
  }
  return index;
}

function trimTrailing(text: string, start: number, end: number): number {
  let index = end;
  while (index > start && /\s/.test(text[index - 1])) {
    index -= 1;
  }
  return index;
}
