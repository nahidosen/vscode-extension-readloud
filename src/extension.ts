import * as vscode from 'vscode';
import { READLOUD_COMMANDS, READLOUD_VIEW_TYPE } from './constants';
import { HighlightManager } from './highlighting';
import { PlaybackController } from './playbackController';
import { ReadLoudStatusBar } from './statusBar';
import { EspeakAdapter } from './tts/espeakAdapter';
import { SpeechDispatcherAdapter } from './tts/speechDispatcherAdapter';
import { getReadLoudConfig } from './config';
import { ReadLoudControlsViewProvider } from './controlsView';

export function activate(context: vscode.ExtensionContext): void {
  const config = getReadLoudConfig();
  const highlighter = new HighlightManager(config.highlight);
  const statusBar = new ReadLoudStatusBar();

  const controller = new PlaybackController({
    highlighter,
    statusBar,
    adapters: [new EspeakAdapter(), new SpeechDispatcherAdapter()]
  });

  const register = (command: string, callback: () => Promise<void>): void => {
    context.subscriptions.push(vscode.commands.registerCommand(command, callback));
  };

  register(READLOUD_COMMANDS.START, () => controller.start());
  register(READLOUD_COMMANDS.START_FROM_CURSOR, () => controller.startFromCursor());
  register(READLOUD_COMMANDS.START_SELECTION, () => controller.startSelection());
  register(READLOUD_COMMANDS.START_SELECTION_TO_END, () => controller.startSelectionToEnd());
  register(READLOUD_COMMANDS.PICK_ENGINE, () => controller.pickEngine());
  register(READLOUD_COMMANDS.ENGINE_AUTO, () => controller.setEngineAuto());
  register(READLOUD_COMMANDS.ENGINE_ESPEAK, () => controller.setEngineEspeak());
  register(READLOUD_COMMANDS.ENGINE_SPEECH_DISPATCHER, () => controller.setEngineSpeechDispatcher());
  register(READLOUD_COMMANDS.PICK_VOICE, () => controller.pickVoice());
  register(READLOUD_COMMANDS.CLEAR_VOICE, () => controller.clearVoice());
  register(READLOUD_COMMANDS.SET_VOICE_LANGUAGE, () => controller.setVoiceLanguage());
  register(READLOUD_COMMANDS.SET_SPEECH_DISPATCHER_VOICE_TYPE, () => controller.setSpeechDispatcherVoiceType());
  register(READLOUD_COMMANDS.PAUSE, () => controller.pause());
  register(READLOUD_COMMANDS.RESUME, () => controller.resume());
  register(READLOUD_COMMANDS.STOP, () => controller.stop(true));
  register(READLOUD_COMMANDS.NEXT_SENTENCE, () => controller.nextSentence());
  register(READLOUD_COMMANDS.PREVIOUS_SENTENCE, () => controller.previousSentence());

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(READLOUD_VIEW_TYPE, new ReadLoudControlsViewProvider())
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      void controller.onDidChangeConfiguration(event);
    })
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      void controller.onDidChangeActiveEditor(editor);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      void controller.onDidChangeDocument(event);
    })
  );

  context.subscriptions.push(controller, highlighter, statusBar);
}

export function deactivate(): void {
  // Disposables handle teardown.
}
