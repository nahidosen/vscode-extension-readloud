import * as vscode from 'vscode';
import { READLOUD_COMMANDS, STATUS_BAR } from './constants';
import { PlaybackState } from './types';

export class ReadLoudStatusBar implements vscode.Disposable {
  private readonly primary: vscode.StatusBarItem;
  private readonly stop: vscode.StatusBarItem;
  private visible = false;

  constructor() {
    this.primary = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, STATUS_BAR.PRIMARY_PRIORITY);
    this.stop = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, STATUS_BAR.STOP_PRIORITY);

    this.primary.name = STATUS_BAR.PRIMARY_NAME;
    this.stop.name = STATUS_BAR.STOP_NAME;

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
        this.primary.command = READLOUD_COMMANDS.PAUSE;

        this.stop.text = '$(primitive-square) Stop';
        this.stop.tooltip = 'ReadLoud: Stop';
        this.stop.command = READLOUD_COMMANDS.STOP;
        this.stop.show();
        break;
      case 'paused':
        this.primary.text = '$(play) ReadLoud';
        this.primary.tooltip = 'ReadLoud: Resume';
        this.primary.command = READLOUD_COMMANDS.RESUME;

        this.stop.text = '$(primitive-square) Stop';
        this.stop.tooltip = 'ReadLoud: Stop';
        this.stop.command = READLOUD_COMMANDS.STOP;
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
        this.primary.command = READLOUD_COMMANDS.START;
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
