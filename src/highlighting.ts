import * as vscode from 'vscode';
import { HighlightColors, WordToken } from './types';

interface WordAnimationOptions {
  autoScroll: boolean;
  signal: AbortSignal;
}

function createWordDecoration(color: string): vscode.TextEditorDecorationType {
  return vscode.window.createTextEditorDecorationType({
    backgroundColor: color,
    borderRadius: '2px'
  });
}

function createSentenceDecoration(color: string): vscode.TextEditorDecorationType {
  return vscode.window.createTextEditorDecorationType({
    backgroundColor: color,
    borderRadius: '3px'
  });
}

function createLineDecoration(color: string): vscode.TextEditorDecorationType {
  return vscode.window.createTextEditorDecorationType({
    isWholeLine: true,
    backgroundColor: color
  });
}

function delay(ms: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    const onAbort = (): void => {
      clearTimeout(timeout);
      resolve();
    };

    signal.addEventListener('abort', onAbort, { once: true });
  });
}

export class HighlightManager implements vscode.Disposable {
  private wordDecoration: vscode.TextEditorDecorationType;
  private sentenceDecoration: vscode.TextEditorDecorationType;
  private lineDecoration: vscode.TextEditorDecorationType;

  constructor(colors: HighlightColors) {
    this.wordDecoration = createWordDecoration(colors.wordColor);
    this.sentenceDecoration = createSentenceDecoration(colors.sentenceColor);
    this.lineDecoration = createLineDecoration(colors.lineColor);
  }

  public updateColors(colors: HighlightColors): void {
    this.wordDecoration.dispose();
    this.sentenceDecoration.dispose();
    this.lineDecoration.dispose();

    this.wordDecoration = createWordDecoration(colors.wordColor);
    this.sentenceDecoration = createSentenceDecoration(colors.sentenceColor);
    this.lineDecoration = createLineDecoration(colors.lineColor);
  }

  public showSentenceAndLine(
    editor: vscode.TextEditor,
    sentenceRange: vscode.Range,
    lineRange: vscode.Range,
    autoScroll: boolean
  ): void {
    editor.setDecorations(this.sentenceDecoration, [sentenceRange]);
    editor.setDecorations(this.lineDecoration, [lineRange]);

    if (autoScroll) {
      editor.revealRange(sentenceRange, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
    }
  }

  public showWord(editor: vscode.TextEditor, wordRange: vscode.Range, autoScroll: boolean): void {
    editor.setDecorations(this.wordDecoration, [wordRange]);

    if (autoScroll) {
      editor.revealRange(wordRange, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
    }
  }

  public clearWord(editor: vscode.TextEditor): void {
    editor.setDecorations(this.wordDecoration, []);
  }

  public clearAll(editor: vscode.TextEditor): void {
    editor.setDecorations(this.wordDecoration, []);
    editor.setDecorations(this.sentenceDecoration, []);
    editor.setDecorations(this.lineDecoration, []);
  }

  public async animateWords(
    editor: vscode.TextEditor,
    words: WordToken[],
    durationsMs: number[],
    options: WordAnimationOptions
  ): Promise<void> {
    if (words.length === 0) {
      return;
    }

    for (let index = 0; index < words.length; index += 1) {
      if (options.signal.aborted) {
        return;
      }

      this.showWord(editor, words[index].range, options.autoScroll);
      const duration = durationsMs[index] ?? durationsMs[durationsMs.length - 1] ?? 120;
      await delay(duration, options.signal);
    }
  }

  public dispose(): void {
    this.wordDecoration.dispose();
    this.sentenceDecoration.dispose();
    this.lineDecoration.dispose();
  }
}
