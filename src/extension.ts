import * as vscode from 'vscode';
import { HighlightManager } from './highlighting';
import { PlaybackController } from './playbackController';
import { ReadLoudStatusBar } from './statusBar';
import { EspeakAdapter } from './tts/espeakAdapter';
import { SpeechDispatcherAdapter } from './tts/speechDispatcherAdapter';
import { getReadLoudConfig, READLOUD_SECTION } from './config';

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

  register('readLoud.start', () => controller.start());
  register('readLoud.pause', () => controller.pause());
  register('readLoud.resume', () => controller.resume());
  register('readLoud.stop', () => controller.stop(true));
  register('readLoud.nextSentence', () => controller.nextSentence());
  register('readLoud.previousSentence', () => controller.previousSentence());

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(READLOUD_SECTION)) {
        controller.reloadConfig();
      }
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
