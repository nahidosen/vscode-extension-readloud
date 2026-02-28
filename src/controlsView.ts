import * as vscode from 'vscode';

export class ReadLoudControlsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'readLoud.controls';

  public resolveWebviewView(view: vscode.WebviewView): void {
    view.webview.options = {
      enableScripts: true
    };

    view.webview.html = this.html();

    view.webview.onDidReceiveMessage((message: unknown) => {
      if (!isCommandMessage(message)) {
        return;
      }

      void vscode.commands.executeCommand(message.command);
    });
  }

  private html(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      margin: 0;
      padding: 8px;
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background: transparent;
    }

    .section {
      margin-bottom: 8px;
    }

    .label {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
    }

    button {
      border: 1px solid var(--vscode-button-border, var(--vscode-editorWidget-border));
      background: var(--vscode-button-secondaryBackground, var(--vscode-editorWidget-background));
      color: var(--vscode-button-secondaryForeground, var(--vscode-foreground));
      border-radius: 4px;
      padding: 3px 8px;
      cursor: pointer;
      font-size: 12px;
      line-height: 1.2;
      min-height: 24px;
      transition: transform 90ms ease, opacity 120ms ease, background-color 120ms ease;
    }

    button:hover {
      background: var(--vscode-list-hoverBackground);
    }

    button:focus-visible {
      outline: 1px solid var(--vscode-focusBorder);
      outline-offset: 1px;
    }

    button:active,
    button.pressed {
      transform: translateY(1px);
      opacity: 0.82;
      background: var(--vscode-list-activeSelectionBackground);
      color: var(--vscode-list-activeSelectionForeground);
    }

    .status {
      margin-top: 8px;
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      min-height: 14px;
    }

    .hint {
      margin-top: 8px;
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
    }
  </style>
</head>
<body>
  <div class="section">
    <div class="label">Start Modes</div>
    <div class="row">
      <button data-cmd="readLoud.start">From Beginning</button>
      <button data-cmd="readLoud.startFromCursor">Cursor to End</button>
      <button data-cmd="readLoud.startSelection">Selection Only</button>
      <button data-cmd="readLoud.startSelectionToEnd">Selection to End</button>
    </div>
  </div>
  <div class="section">
    <div class="label">Playback</div>
    <div class="row">
      <button data-cmd="readLoud.previousSentence">Back</button>
      <button data-cmd="readLoud.nextSentence">Forward</button>
      <button data-cmd="readLoud.pause">Pause</button>
      <button data-cmd="readLoud.resume">Resume</button>
      <button data-cmd="readLoud.stop">Stop</button>
    </div>
  </div>
  <div id="status" class="status">Ready.</div>
  <div class="hint">Drag this "ReadLoud Controls" view by its title to move it across Explorer, Sidebars, or Panel.</div>

  <script>
    const vscode = acquireVsCodeApi();
    const status = document.getElementById('status');
    document.querySelectorAll('button[data-cmd]').forEach((button) => {
      button.addEventListener('click', () => {
        button.classList.add('pressed');
        setTimeout(() => button.classList.remove('pressed'), 140);

        if (status) {
          status.textContent = 'Command sent: ' + (button.textContent || 'Action').trim();
        }

        vscode.postMessage({ command: button.dataset.cmd });
      });
    });
  </script>
</body>
</html>`;
  }
}

function isCommandMessage(value: unknown): value is { command: string } {
  return typeof value === 'object' && value !== null && 'command' in value && typeof (value as { command: unknown }).command === 'string';
}
