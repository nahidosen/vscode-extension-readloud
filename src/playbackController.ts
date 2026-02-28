import * as vscode from 'vscode';
import { getReadLoudConfig } from './config';
import { HighlightManager } from './highlighting';
import { buildSentenceUnits } from './markdown';
import { ReadLoudStatusBar } from './statusBar';
import { estimateSentenceDurationMs, estimateWordDurations } from './timing';
import { PlaybackState, ReadLoudConfig, SentenceUnit, TtsEngineAdapter } from './types';
import { selectEngine } from './tts/engineSelector';
import { isSupportedLanguageId, supportedLanguageLabel } from './languageSupport';

interface ControllerDependencies {
  highlighter: HighlightManager;
  statusBar: ReadLoudStatusBar;
  adapters: TtsEngineAdapter[];
}

export class PlaybackController implements vscode.Disposable {
  private readonly highlighter: HighlightManager;
  private readonly statusBar: ReadLoudStatusBar;
  private readonly adapters: TtsEngineAdapter[];

  private state: PlaybackState = 'idle';
  private config: ReadLoudConfig = getReadLoudConfig();
  private activeAdapter: TtsEngineAdapter | undefined;

  private sentenceUnits: SentenceUnit[] = [];
  private currentIndex = 0;
  private sourceDocumentUri: string | undefined;
  private sourceDocumentVersion: number | undefined;

  private runAbort: AbortController | undefined;
  private runPromise: Promise<void> | undefined;
  private runToken = 0;

  private wordAbort: AbortController | undefined;

  constructor(deps: ControllerDependencies) {
    this.highlighter = deps.highlighter;
    this.statusBar = deps.statusBar;
    this.adapters = deps.adapters;
    this.statusBar.setVisible(this.config.showStatusBar, this.state);
  }

  public getState(): PlaybackState {
    return this.state;
  }

  public async start(): Promise<void> {
    await this.startInternal();
  }

  public async startSelection(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !isSupportedLanguageId(editor.document.languageId)) {
      vscode.window.showWarningMessage(
        `ReadLoud: Open a supported text editor first (${supportedLanguageLabel()}).`
      );
      return;
    }

    if (editor.selection.isEmpty) {
      vscode.window.showWarningMessage('ReadLoud: Select text to use selection-only reading.');
      return;
    }

    await this.startInternal(editor.selection);
  }

  public async startFromCursor(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !isSupportedLanguageId(editor.document.languageId)) {
      vscode.window.showWarningMessage(
        `ReadLoud: Open a supported text editor first (${supportedLanguageLabel()}).`
      );
      return;
    }

    const scope = this.createRangeToDocumentEnd(editor.document, editor.selection.active);
    if (scope.isEmpty) {
      vscode.window.showWarningMessage('ReadLoud: Cursor is already at the end of the document.');
      return;
    }

    await this.startInternal(scope);
  }

  public async startSelectionToEnd(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !isSupportedLanguageId(editor.document.languageId)) {
      vscode.window.showWarningMessage(
        `ReadLoud: Open a supported text editor first (${supportedLanguageLabel()}).`
      );
      return;
    }

    if (editor.selection.isEmpty) {
      vscode.window.showWarningMessage('ReadLoud: Select text to use selection-to-end reading.');
      return;
    }

    const scope = this.createRangeToDocumentEnd(editor.document, editor.selection.start);
    if (scope.isEmpty) {
      vscode.window.showWarningMessage('ReadLoud: Selection start is already at the end of the document.');
      return;
    }

    await this.startInternal(scope);
  }

  private async startInternal(scope?: vscode.Range): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !isSupportedLanguageId(editor.document.languageId)) {
      vscode.window.showWarningMessage(
        `ReadLoud: Open a supported text editor first (${supportedLanguageLabel()}).`
      );
      return;
    }

    if (!this.ensureUbuntu()) {
      return;
    }

    await this.stop(false);

    this.reloadConfig();
    const selection = await selectEngine(this.config.engine, this.adapters);
    this.activeAdapter = selection.adapter;

    if (!this.activeAdapter) {
      vscode.window.showErrorMessage(`ReadLoud: ${selection.reason}`);
      return;
    }

    if (selection.reason.includes('falling back')) {
      vscode.window.showWarningMessage(`ReadLoud: ${selection.reason}`);
    }

    this.sentenceUnits = buildSentenceUnits(editor.document, scope);
    if (this.sentenceUnits.length === 0) {
      if (scope) {
        vscode.window.showWarningMessage('ReadLoud: No readable prose found in the selected text.');
      } else {
        vscode.window.showWarningMessage('ReadLoud: No readable prose found in this file.');
      }
      return;
    }

    this.currentIndex = 0;
    this.sourceDocumentUri = editor.document.uri.toString();
    this.sourceDocumentVersion = editor.document.version;

    this.setState('playing');
    this.startRun(editor);
  }

  public async pause(): Promise<void> {
    if (this.state !== 'playing') {
      return;
    }

    this.setState('paused');
    await this.cancelRun();

    const editor = vscode.window.activeTextEditor;
    if (editor) {
      this.highlighter.clearWord(editor);
    }
  }

  public async resume(): Promise<void> {
    if (this.state !== 'paused') {
      return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor || !isSupportedLanguageId(editor.document.languageId)) {
      vscode.window.showWarningMessage(
        `ReadLoud: Resume requires an active supported text editor (${supportedLanguageLabel()}).`
      );
      return;
    }

    if (this.sourceDocumentUri !== editor.document.uri.toString() || this.sourceDocumentVersion !== editor.document.version) {
      vscode.window.showInformationMessage('ReadLoud: Document changed. Starting from the beginning.');
      await this.start();
      return;
    }

    if (!this.activeAdapter) {
      await this.start();
      return;
    }

    this.setState('playing');
    this.startRun(editor);
  }

  public async stop(showNotification = false): Promise<void> {
    if (this.state === 'idle') {
      return;
    }

    this.setState('stopping');
    await this.cancelRun();

    const editor = vscode.window.activeTextEditor;
    if (editor) {
      this.highlighter.clearAll(editor);
    }

    this.sentenceUnits = [];
    this.currentIndex = 0;
    this.sourceDocumentUri = undefined;
    this.sourceDocumentVersion = undefined;

    this.setState('idle');

    if (showNotification) {
      vscode.window.showInformationMessage('ReadLoud: Stopped.');
    }
  }

  public async nextSentence(): Promise<void> {
    if (this.sentenceUnits.length === 0) {
      await this.start();
      return;
    }

    this.currentIndex = Math.min(this.sentenceUnits.length - 1, this.currentIndex + 1);
    await this.handleJump();
  }

  public async previousSentence(): Promise<void> {
    if (this.sentenceUnits.length === 0) {
      await this.start();
      return;
    }

    this.currentIndex = Math.max(0, this.currentIndex - 1);
    await this.handleJump();
  }

  public async onDidChangeActiveEditor(editor: vscode.TextEditor | undefined): Promise<void> {
    if ((this.state === 'playing' || this.state === 'paused') && this.sourceDocumentUri) {
      if (!editor || editor.document.uri.toString() !== this.sourceDocumentUri) {
        await this.stop();
        vscode.window.showInformationMessage('ReadLoud: Playback stopped because the active editor changed.');
      }
    }
  }

  public async onDidChangeDocument(event: vscode.TextDocumentChangeEvent): Promise<void> {
    if ((this.state === 'playing' || this.state === 'paused') && this.sourceDocumentUri) {
      if (event.document.uri.toString() === this.sourceDocumentUri) {
        await this.stop();
        vscode.window.showInformationMessage('ReadLoud: Playback stopped because the document changed.');
      }
    }
  }

  public reloadConfig(): void {
    this.config = getReadLoudConfig();
    this.highlighter.updateColors(this.config.highlight);
    this.statusBar.setVisible(this.config.showStatusBar, this.state);
  }

  private async handleJump(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !isSupportedLanguageId(editor.document.languageId)) {
      return;
    }

    if (this.state === 'playing') {
      await this.cancelRun();
      this.setState('playing');
      this.startRun(editor);
      return;
    }

    const sentence = this.sentenceUnits[this.currentIndex];
    if (sentence) {
      this.highlighter.showSentenceAndLine(editor, sentence.range, sentence.lineRange, this.config.autoScroll);
      this.highlighter.clearWord(editor);
    }
  }

  private startRun(editor: vscode.TextEditor): void {
    const token = ++this.runToken;
    const abortController = new AbortController();
    this.runAbort = abortController;

    this.runPromise = this.runLoop(token, editor, abortController.signal)
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`ReadLoud: ${message}`);
      })
      .finally(() => {
        if (this.runToken !== token) {
          return;
        }

        this.runAbort = undefined;
        this.runPromise = undefined;
      });
  }

  private async runLoop(token: number, editor: vscode.TextEditor, signal: AbortSignal): Promise<void> {
    const adapter = this.activeAdapter;
    if (!adapter) {
      throw new Error('No active speech engine selected.');
    }

    while (
      this.runToken === token &&
      !signal.aborted &&
      this.state === 'playing' &&
      this.currentIndex >= 0 &&
      this.currentIndex < this.sentenceUnits.length
    ) {
      const unit = this.sentenceUnits[this.currentIndex];
      this.highlighter.showSentenceAndLine(editor, unit.range, unit.lineRange, this.config.autoScroll);

      const sentenceDurationMs = estimateSentenceDurationMs(unit.text, this.config.syncBaseWpm);
      const wordDurations = estimateWordDurations(unit.words, sentenceDurationMs);

      this.wordAbort?.abort();
      const sentenceWordAbort = new AbortController();
      this.wordAbort = sentenceWordAbort;
      const abortWordAnimation = (): void => {
        sentenceWordAbort.abort();
      };
      signal.addEventListener('abort', abortWordAnimation, { once: true });

      const wordPromise = this.highlighter.animateWords(editor, unit.words, wordDurations, {
        autoScroll: this.config.autoScroll,
        signal: sentenceWordAbort.signal
      });

      try {
        await adapter.speakSentence(unit.text, {
          voice: this.config.voice,
          rate: this.config.rate,
          pitch: this.config.pitch,
          volume: this.config.volume,
          signal
        });
      } finally {
        signal.removeEventListener('abort', abortWordAnimation);
        sentenceWordAbort.abort();
        await wordPromise;
        if (this.wordAbort === sentenceWordAbort) {
          this.wordAbort = undefined;
        }
        this.highlighter.clearWord(editor);
      }

      if (signal.aborted || this.state !== 'playing') {
        return;
      }

      this.currentIndex += 1;
    }

    if (this.currentIndex >= this.sentenceUnits.length) {
      this.highlighter.clearAll(editor);
      this.sentenceUnits = [];
      this.currentIndex = 0;
      this.setState('idle');
      vscode.window.showInformationMessage('ReadLoud: Reached end of document.');
    }
  }

  private async cancelRun(): Promise<void> {
    this.runAbort?.abort();
    this.wordAbort?.abort();

    await this.activeAdapter?.stop();

    try {
      await this.runPromise;
    } catch {
      // Errors are surfaced by run handlers.
    }
  }

  private setState(next: PlaybackState): void {
    this.state = next;
    this.statusBar.update(next);
  }

  private ensureUbuntu(): boolean {
    if (process.platform !== 'linux') {
      vscode.window.showErrorMessage('ReadLoud currently supports Ubuntu/Linux only.');
      return false;
    }

    return true;
  }

  public dispose(): void {
    void this.stop();
  }

  private createRangeToDocumentEnd(document: vscode.TextDocument, start: vscode.Position): vscode.Range {
    const lastLine = document.lineAt(document.lineCount - 1);
    return new vscode.Range(start, lastLine.range.end);
  }
}
