import * as vscode from 'vscode';
import { PlaybackState } from './types';

export class ReadLoudStatusBar implements vscode.Disposable {
  private readonly primary: vscode.StatusBarItem;
  private readonly stop: vscode.StatusBarItem;
  private visible = false;

  constructor() {
    this.primary = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.stop = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);

    this.primary.name = 'ReadLoud';
    this.stop.name = 'ReadLoud Stop';

    this.update('idle');
  }

  public update(state: PlaybackState): void {
    if (!this.visible) {
      this.primary.hide();
      this.stop.hide();
      return;
    }

    switch (state) {
      case 'playing':
        this.primary.text = '$(debug-pause) ReadLoud';
        this.primary.tooltip = 'ReadLoud: Pause';
        this.primary.command = 'readLoud.pause';

        this.stop.text = '$(primitive-square) Stop';
        this.stop.tooltip = 'ReadLoud: Stop';
        this.stop.command = 'readLoud.stop';
        this.stop.show();
        break;
      case 'paused':
        this.primary.text = '$(play) ReadLoud';
        this.primary.tooltip = 'ReadLoud: Resume';
        this.primary.command = 'readLoud.resume';

        this.stop.text = '$(primitive-square) Stop';
        this.stop.tooltip = 'ReadLoud: Stop';
        this.stop.command = 'readLoud.stop';
        this.stop.show();
        break;
      case 'stopping':
        this.primary.text = '$(sync~spin) ReadLoud';
        this.primary.tooltip = 'ReadLoud is stopping';
        this.primary.command = undefined;
        this.stop.hide();
        break;
      case 'idle':
      default:
        this.primary.text = '$(unmute) ReadLoud';
        this.primary.tooltip = 'ReadLoud: Start';
        this.primary.command = 'readLoud.start';
        this.stop.hide();
        break;
    }
  }

  public setVisible(visible: boolean, state: PlaybackState): void {
    this.visible = visible;
    this.update(state);
  }

  public dispose(): void {
    this.primary.dispose();
    this.stop.dispose();
  }
}
