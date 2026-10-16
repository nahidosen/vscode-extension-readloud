import * as vscode from 'vscode';
import { getReadLoudConfig } from './config';
import {
  ENGINE_VALUES,
  ENGINE_DISPLAY_NAMES,
  PLAYBACK_TIMINGS_MS,
  READLOUD_DEFAULTS,
  READLOUD_LIMITS,
  READLOUD_SECTION,
  READLOUD_SETTINGS,
  SPEECH_DISPATCHER_VOICE_TYPES,
  SUPPORTED_PLATFORM,
  SUPPORTED_PLATFORM_LABEL
} from './constants';
import { HighlightManager } from './highlighting';
import { buildSentenceUnits } from './markdown';
import { ReadLoudStatusBar } from './statusBar';
import { estimateSentenceDurationMs, estimateWordDurations } from './timing';
import {
  EngineSetting,
  PlaybackState,
  ReadLoudConfig,
  SentenceUnit,
  SpeechDispatcherVoiceType,
  TtsEngineAdapter
} from './types';
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
  private liveConfigRestartTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(deps: ControllerDependencies) {
    this.highlighter = deps.highlighter;
    this.statusBar = deps.statusBar;
    this.adapters = deps.adapters;
    this.statusBar.setVisible(this.config.showStatusBar, this.state);
  }

  public async pickEngine(): Promise<void> {
    const items: Array<vscode.QuickPickItem & { value: EngineSetting }> = [
      { label: ENGINE_DISPLAY_NAMES.auto, detail: 'Use first available engine', value: ENGINE_VALUES.AUTO },
      { label: ENGINE_DISPLAY_NAMES.espeak, detail: 'Classic local CLI engine', value: ENGINE_VALUES.ESPEAK },
      {
        label: ENGINE_DISPLAY_NAMES.speechDispatcher,
        detail: 'System speech-dispatcher backend',
        value: ENGINE_VALUES.SPEECH_DISPATCHER
      }
    ];

    const choice = await vscode.window.showQuickPick(items, {
      placeHolder: `Current engine: ${this.config.engine}`
    });

    if (!choice) {
      return;
    }

    await this.updateSetting(READLOUD_SETTINGS.ENGINE, choice.value);
    vscode.window.showInformationMessage(`ReadLoud: Engine set to ${choice.label}.`);
  }

  public async setEngineAuto(): Promise<void> {
    await this.updateSetting(READLOUD_SETTINGS.ENGINE, ENGINE_VALUES.AUTO);
    vscode.window.showInformationMessage(`ReadLoud: Engine set to ${ENGINE_DISPLAY_NAMES.auto}.`);
  }

  public async setEngineEspeak(): Promise<void> {
    await this.updateSetting(READLOUD_SETTINGS.ENGINE, ENGINE_VALUES.ESPEAK);
    vscode.window.showInformationMessage(`ReadLoud: Engine set to ${ENGINE_DISPLAY_NAMES.espeak}.`);
  }

  public async setEngineSpeechDispatcher(): Promise<void> {
    await this.updateSetting(READLOUD_SETTINGS.ENGINE, ENGINE_VALUES.SPEECH_DISPATCHER);
    vscode.window.showInformationMessage(`ReadLoud: Engine set to ${ENGINE_DISPLAY_NAMES.speechDispatcher}.`);
  }

  public async pickVoice(): Promise<void> {
    this.reloadConfig();
    const selection = await selectEngine(this.config.engine, this.adapters);
    const adapter = selection.adapter;

    if (!adapter) {
      vscode.window.showWarningMessage(`ReadLoud: ${selection.reason}`);
      return;
    }

    const voices = await adapter.listVoices();
    if (voices.length === 0) {
      await this.setVoiceManually(adapter.displayName);
      return;
    }

    const items = voices.map((voice) => ({
      label: voice.label,
      detail: voice.detail,
      value: voice.id
    }));
    items.unshift({
      label: '$(edit) Enter Voice Manually',
      detail: 'Type a voice id manually',
      value: '__manual__'
    });

    const choice = await vscode.window.showQuickPick(items, {
      placeHolder: `Select voice for ${adapter.displayName}`
    });

    if (!choice) {
      return;
    }

    if (choice.value === '__manual__') {
      await this.setVoiceManually(adapter.displayName);
      return;
    }

    await this.updateSetting(READLOUD_SETTINGS.VOICE, choice.value);
    vscode.window.showInformationMessage(`ReadLoud: Voice set to ${choice.label}.`);
  }

  public async clearVoice(): Promise<void> {
    await this.updateSetting(READLOUD_SETTINGS.VOICE, READLOUD_DEFAULTS.VOICE);
    vscode.window.showInformationMessage('ReadLoud: Voice reset to engine default.');
  }

  public async setVoiceLanguage(): Promise<void> {
    const input = await vscode.window.showInputBox({
      prompt: 'Set preferred voice language (ISO code), e.g. en, en-us, fr',
      value: this.config.voiceLanguage,
      ignoreFocusOut: true
    });

    if (input === undefined) {
      return;
    }

    await this.updateSetting(READLOUD_SETTINGS.VOICE_LANGUAGE, input.trim());
    if (input.trim().length === 0) {
      vscode.window.showInformationMessage('ReadLoud: Voice language preference cleared.');
    } else {
      vscode.window.showInformationMessage(`ReadLoud: Voice language set to ${input.trim()}.`);
    }
  }

  public async setSpeechDispatcherVoiceType(): Promise<void> {
    const options: SpeechDispatcherVoiceType[] = [...SPEECH_DISPATCHER_VOICE_TYPES];

    const items = options.map((value) => ({
      label: value === '' ? 'Default' : value,
      value
    }));

    const choice = await vscode.window.showQuickPick(items, {
      placeHolder: `Current speech-dispatcher voice type: ${this.config.speechDispatcherVoiceType || 'default'}`
    });

    if (!choice) {
      return;
    }

    await this.updateSetting(READLOUD_SETTINGS.SPEECH_DISPATCHER_VOICE_TYPE, choice.value);
    vscode.window.showInformationMessage(`ReadLoud: speech-dispatcher voice type set to ${choice.label}.`);
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

    if (!this.ensureSupportedPlatform()) {
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
    this.clearLiveConfigRestart();

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

  public async onDidChangeConfiguration(event: vscode.ConfigurationChangeEvent): Promise<void> {
    if (!event.affectsConfiguration(READLOUD_SECTION)) {
      return;
    }

    const shouldRestartCurrentSentence =
      this.state === 'playing' &&
      (event.affectsConfiguration(`${READLOUD_SECTION}.${READLOUD_SETTINGS.SPEED_MULTIPLIER}`) ||
        event.affectsConfiguration(`${READLOUD_SECTION}.${READLOUD_SETTINGS.RATE}`) ||
        event.affectsConfiguration(`${READLOUD_SECTION}.${READLOUD_SETTINGS.SYNC_BASE_WPM}`));

    this.reloadConfig();

    if (!shouldRestartCurrentSentence) {
      return;
    }

    this.scheduleLiveConfigRestart();
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

      const baseSentenceDurationMs = estimateSentenceDurationMs(unit.text, this.config.syncBaseWpm);
      const speedAdjustedDurationMs = Math.round(
        baseSentenceDurationMs / Math.max(READLOUD_LIMITS.SPEED_MIN, this.config.speedMultiplier)
      );
      const wordDurations = estimateWordDurations(unit.words, speedAdjustedDurationMs);

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
          voiceLanguage: this.config.voiceLanguage,
          speechDispatcherVoiceType: this.config.speechDispatcherVoiceType,
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

  private ensureSupportedPlatform(): boolean {
    if (process.platform !== SUPPORTED_PLATFORM) {
      vscode.window.showErrorMessage(`ReadLoud currently supports ${SUPPORTED_PLATFORM_LABEL} only.`);
      return false;
    }

    return true;
  }

  public dispose(): void {
    this.clearLiveConfigRestart();
    void this.stop();
  }

  private createRangeToDocumentEnd(document: vscode.TextDocument, start: vscode.Position): vscode.Range {
    const lastLine = document.lineAt(document.lineCount - 1);
    return new vscode.Range(start, lastLine.range.end);
  }

  private async updateSetting(key: string, value: unknown): Promise<void> {
    await vscode.workspace.getConfiguration(READLOUD_SECTION).update(key, value, vscode.ConfigurationTarget.Global);
    this.reloadConfig();
  }

  private async setVoiceManually(engineDisplayName: string): Promise<void> {
    const input = await vscode.window.showInputBox({
      prompt: `Enter voice id for ${engineDisplayName} (leave empty for default)`,
      value: this.config.voice,
      ignoreFocusOut: true
    });

    if (input === undefined) {
      return;
    }

    await this.updateSetting(READLOUD_SETTINGS.VOICE, input.trim());
    if (input.trim().length === 0) {
      vscode.window.showInformationMessage('ReadLoud: Voice reset to engine default.');
    } else {
      vscode.window.showInformationMessage(`ReadLoud: Voice set to ${input.trim()}.`);
    }
  }

  private scheduleLiveConfigRestart(): void {
    this.clearLiveConfigRestart();
    this.liveConfigRestartTimer = setTimeout(() => {
      void this.restartCurrentSentenceWithUpdatedConfig();
    }, PLAYBACK_TIMINGS_MS.LIVE_CONFIG_RESTART_DEBOUNCE);
  }

  private clearLiveConfigRestart(): void {
    if (!this.liveConfigRestartTimer) {
      return;
    }

    clearTimeout(this.liveConfigRestartTimer);
    this.liveConfigRestartTimer = undefined;
  }

  private async restartCurrentSentenceWithUpdatedConfig(): Promise<void> {
    this.liveConfigRestartTimer = undefined;

    if (this.state !== 'playing') {
      return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor || !isSupportedLanguageId(editor.document.languageId)) {
      return;
    }

    if (!this.sourceDocumentUri || editor.document.uri.toString() !== this.sourceDocumentUri) {
      return;
    }

    if (this.sourceDocumentVersion !== editor.document.version) {
      return;
    }

    await this.cancelRun();
    if (this.state !== 'playing') {
      return;
    }

    this.startRun(editor);
  }
}
