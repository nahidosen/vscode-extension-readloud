import * as vscode from 'vscode';
import { SentenceUnit, WordToken } from './types';
import { extractVisibleProseLines, extractWordSpans, sentenceSpans } from './markdownCore';

export { extractVisibleProseLines, extractWordSpans, sentenceSpans } from './markdownCore';

export function buildSentenceUnits(document: vscode.TextDocument): SentenceUnit[] {
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
