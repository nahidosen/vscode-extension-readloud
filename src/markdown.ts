import * as vscode from 'vscode';
import { SentenceUnit, WordToken } from './types';
import { extractVisibleProseLines, extractWordSpans, sentenceSpans } from './markdownCore';

export { extractVisibleProseLines, extractWordSpans, sentenceSpans } from './markdownCore';

export function buildSentenceUnits(document: vscode.TextDocument, scope?: vscode.Range): SentenceUnit[] {
  if (scope && !scope.isEmpty) {
    return buildSentenceUnitsForSelection(document, scope);
  }

  const proseLines = extractVisibleProseLines(document.getText());
  const units: SentenceUnit[] = [];

  for (const proseLine of proseLines) {
    const spans = sentenceSpans(proseLine.text);
    for (const span of spans) {
      const sentenceText = proseLine.text.slice(span.start, span.end);
      const sentenceRange = new vscode.Range(
        new vscode.Position(proseLine.line, proseLine.startCol + span.start),
        new vscode.Position(proseLine.line, proseLine.startCol + span.end)
      );
      const lineRange = new vscode.Range(
        new vscode.Position(proseLine.line, 0),
        new vscode.Position(proseLine.line, proseLine.rawLength)
      );

      const words: WordToken[] = extractWordSpans(sentenceText).map((word) => ({
        text: word.text,
        range: new vscode.Range(
          new vscode.Position(proseLine.line, proseLine.startCol + span.start + word.start),
          new vscode.Position(proseLine.line, proseLine.startCol + span.start + word.end)
        )
      }));

      units.push({
        text: sentenceText,
        range: sentenceRange,
        lineRange,
        line: proseLine.line,
        words
      });
    }
  }

  return units;
}

function buildSentenceUnitsForSelection(document: vscode.TextDocument, scope: vscode.Range): SentenceUnit[] {
  const selectedText = document.getText(scope);
  if (selectedText.trim().length === 0) {
    return [];
  }

  const proseLines = extractVisibleProseLines(selectedText);
  const lineOffsets = computeLineStartOffsets(selectedText);
  const baseOffset = document.offsetAt(scope.start);
  const units: SentenceUnit[] = [];

  for (const proseLine of proseLines) {
    const spans = sentenceSpans(proseLine.text);
    for (const span of spans) {
      const sentenceText = proseLine.text.slice(span.start, span.end);
      const sentenceStartLocalOffset = lineOffsets[proseLine.line] + proseLine.startCol + span.start;
      const sentenceEndLocalOffset = lineOffsets[proseLine.line] + proseLine.startCol + span.end;
      const sentenceStart = document.positionAt(baseOffset + sentenceStartLocalOffset);
      const sentenceEnd = document.positionAt(baseOffset + sentenceEndLocalOffset);
      const lineRange = document.lineAt(sentenceStart.line).range;

      const words: WordToken[] = extractWordSpans(sentenceText).map((word) => {
        const wordStartLocalOffset = lineOffsets[proseLine.line] + proseLine.startCol + span.start + word.start;
        const wordEndLocalOffset = lineOffsets[proseLine.line] + proseLine.startCol + span.start + word.end;
        return {
          text: word.text,
          range: new vscode.Range(
            document.positionAt(baseOffset + wordStartLocalOffset),
            document.positionAt(baseOffset + wordEndLocalOffset)
          )
        };
      });

      units.push({
        text: sentenceText,
        range: new vscode.Range(sentenceStart, sentenceEnd),
        lineRange,
        line: sentenceStart.line,
        words
      });
    }
  }

  return units;
}

function computeLineStartOffsets(text: string): number[] {
  const offsets = [0];
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === '\n') {
      offsets.push(index + 1);
    }
  }
  return offsets;
}
