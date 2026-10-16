import * as vscode from 'vscode';
import {
  CONTROL_DEFAULT_SELECTION,
  CONTROL_GROUPS,
  CONTROL_SLIDER_RANGES,
  CONTROL_UI_TEXT,
  CONTROL_UI_TIMINGS_MS,
  type ReadLoudCommand,
  READLOUD_COMMAND_SET,
  NUMERIC_SETTING_KEYS,
  READLOUD_COMMANDS,
  READLOUD_LIMITS,
  READLOUD_SECTION,
  READLOUD_SETTINGS,
  READLOUD_VIEW_TYPE,
  WEBVIEW_MESSAGE_TYPES
} from './constants';

type NumericSettingKey = (typeof NUMERIC_SETTING_KEYS)[number];
type SettingMessage = {
  type: typeof WEBVIEW_MESSAGE_TYPES.SETTING;
  key: NumericSettingKey;
  value: number;
};
type CommandMessage = { command: ReadLoudCommand };

export class ReadLoudControlsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = READLOUD_VIEW_TYPE;

  public resolveWebviewView(view: vscode.WebviewView): void {
    view.webview.options = {
      enableScripts: true
    };

    view.webview.html = this.html();

    view.webview.onDidReceiveMessage(async (message: unknown) => {
      if (!isCommandMessage(message)) {
        if (isSettingMessage(message)) {
          await updateNumericSetting(message.key, message.value);
        }
        return;
      }

      if (!READLOUD_COMMAND_SET.has(message.command)) {
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
    button.pressed,
    button.selected {
      transform: translateY(1px);
      opacity: 0.82;
      background: var(--vscode-list-activeSelectionBackground);
      color: var(--vscode-list-activeSelectionForeground);
    }

    .line {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    input[type="range"] {
      flex: 1;
      accent-color: var(--vscode-button-background);
    }

    .value {
      width: 38px;
      text-align: right;
      font-variant-numeric: tabular-nums;
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
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
      <button data-group="${CONTROL_GROUPS.START}" data-cmd="${READLOUD_COMMANDS.START}">From Beginning</button>
      <button data-group="${CONTROL_GROUPS.START}" data-cmd="${READLOUD_COMMANDS.START_FROM_CURSOR}">Cursor to End</button>
      <button data-group="${CONTROL_GROUPS.START}" data-cmd="${READLOUD_COMMANDS.START_SELECTION}">Selection Only</button>
      <button data-group="${CONTROL_GROUPS.START}" data-cmd="${READLOUD_COMMANDS.START_SELECTION_TO_END}">Selection to End</button>
    </div>
  </div>
  <div class="section">
    <div class="label">Playback</div>
    <div class="row">
      <button data-group="${CONTROL_GROUPS.PLAYBACK}" data-cmd="${READLOUD_COMMANDS.PREVIOUS_SENTENCE}">Back</button>
      <button data-group="${CONTROL_GROUPS.PLAYBACK}" data-cmd="${READLOUD_COMMANDS.NEXT_SENTENCE}">Forward</button>
      <button data-group="${CONTROL_GROUPS.PLAYBACK}" data-cmd="${READLOUD_COMMANDS.PAUSE}">Pause</button>
      <button data-group="${CONTROL_GROUPS.PLAYBACK}" data-cmd="${READLOUD_COMMANDS.RESUME}">Resume</button>
      <button data-group="${CONTROL_GROUPS.PLAYBACK}" data-cmd="${READLOUD_COMMANDS.STOP}">Stop</button>
    </div>
  </div>
  <div class="section">
    <div class="label">Speed Level</div>
    <div class="line">
      <input id="speed" type="range" min="${CONTROL_SLIDER_RANGES.SPEED_MIN}" max="${CONTROL_SLIDER_RANGES.SPEED_MAX}" step="${CONTROL_SLIDER_RANGES.SPEED_STEP}" value="${CONTROL_SLIDER_RANGES.SPEED_DEFAULT}" />
      <span id="speedValue" class="value">${READLOUD_LIMITS.SPEED_MID.toFixed(2)}x</span>
    </div>
  </div>
  <div class="section">
    <div class="label">Volume Level</div>
    <div class="line">
      <input id="volume" type="range" min="${CONTROL_SLIDER_RANGES.VOLUME_MIN}" max="${CONTROL_SLIDER_RANGES.VOLUME_MAX}" step="${CONTROL_SLIDER_RANGES.VOLUME_STEP}" value="${CONTROL_SLIDER_RANGES.VOLUME_DEFAULT}" />
      <span id="volumeValue" class="value">${CONTROL_SLIDER_RANGES.VOLUME_DEFAULT}</span>
    </div>
  </div>
  <div class="section">
    <div class="label">Engine</div>
    <div class="row">
      <button data-group="${CONTROL_GROUPS.ENGINE}" data-cmd="${READLOUD_COMMANDS.ENGINE_AUTO}">Auto</button>
      <button data-group="${CONTROL_GROUPS.ENGINE}" data-cmd="${READLOUD_COMMANDS.ENGINE_ESPEAK}">eSpeak</button>
      <button data-group="${CONTROL_GROUPS.ENGINE}" data-cmd="${READLOUD_COMMANDS.ENGINE_SPEECH_DISPATCHER}">Speech Dispatcher</button>
      <button data-group="${CONTROL_GROUPS.ENGINE}" data-cmd="${READLOUD_COMMANDS.PICK_ENGINE}">Pick Engine</button>
    </div>
  </div>
  <div class="section">
    <div class="label">Voice</div>
    <div class="row">
      <button data-group="${CONTROL_GROUPS.VOICE}" data-cmd="${READLOUD_COMMANDS.PICK_VOICE}">Pick Voice</button>
      <button data-group="${CONTROL_GROUPS.VOICE}" data-cmd="${READLOUD_COMMANDS.CLEAR_VOICE}">Default Voice</button>
      <button data-group="${CONTROL_GROUPS.VOICE}" data-cmd="${READLOUD_COMMANDS.SET_VOICE_LANGUAGE}">Lang</button>
      <button data-group="${CONTROL_GROUPS.VOICE}" data-cmd="${READLOUD_COMMANDS.SET_SPEECH_DISPATCHER_VOICE_TYPE}">Type</button>
    </div>
  </div>
  <div id="status" class="status">${CONTROL_UI_TEXT.READY}</div>
  <div class="hint">${CONTROL_UI_TEXT.MOVE_HINT}</div>

  <script>
    const vscode = acquireVsCodeApi();
    const status = document.getElementById('status');
    const speedInput = document.getElementById('speed');
    const volumeInput = document.getElementById('volume');
    const speedValue = document.getElementById('speedValue');
    const volumeValue = document.getElementById('volumeValue');
    const defaultSelectedByGroup = ${JSON.stringify(CONTROL_DEFAULT_SELECTION)};
    const persisted = vscode.getState() || {};
    const selectedByGroup = {
      ...defaultSelectedByGroup,
      ...(persisted.selectedByGroup || {})
    };
    const speedSettingKey = '${READLOUD_SETTINGS.SPEED_MULTIPLIER}';
    const volumeSettingKey = '${READLOUD_SETTINGS.VOLUME}';
    const settingMessageType = '${WEBVIEW_MESSAGE_TYPES.SETTING}';
    const speedStep = ${READLOUD_LIMITS.SPEED_STEP};
    const speedMin = ${READLOUD_LIMITS.SPEED_MIN};
    const speedMax = ${READLOUD_LIMITS.SPEED_MAX};
    const speedMid = ${READLOUD_LIMITS.SPEED_MID};
    const buttonPressedMs = ${CONTROL_UI_TIMINGS_MS.BUTTON_PRESSED};
    const settingDebounceMs = ${CONTROL_UI_TIMINGS_MS.SETTING_DEBOUNCE};
    let speedTimer;
    let volumeTimer;

    function sliderToSpeed(slider) {
      return speedMid + Number(slider) * speedStep;
    }

    function speedToSlider(speed) {
      const boundedSpeed = Math.max(speedMin, Math.min(speedMax, Number(speed)));
      return Math.round((boundedSpeed - speedMid) / speedStep);
    }

    function selectButton(group, command) {
      document.querySelectorAll('button[data-group="' + group + '"]').forEach((btn) => btn.classList.remove('selected'));
      const target = document.querySelector('button[data-group="' + group + '"][data-cmd="' + command + '"]');
      if (target) {
        target.classList.add('selected');
      }
      selectedByGroup[group] = command;
      vscode.setState({
        selectedByGroup,
        speed: sliderToSpeed(speedInput.value),
        volume: Number(volumeInput.value)
      });
    }

    document.querySelectorAll('button[data-group][data-cmd]').forEach((button) => {
      const group = button.dataset.group;
      const command = button.dataset.cmd;
      if (group && selectedByGroup[group] === command) {
        button.classList.add('selected');
      }
    });

    document.querySelectorAll('button[data-cmd]').forEach((button) => {
      button.addEventListener('click', () => {
        button.classList.add('pressed');
        setTimeout(() => button.classList.remove('pressed'), buttonPressedMs);

        if (button.dataset.group && button.dataset.cmd) {
          selectButton(button.dataset.group, button.dataset.cmd);
        }

        if (status) {
          status.textContent = '${CONTROL_UI_TEXT.COMMAND_SENT_PREFIX}' + (button.textContent || '${CONTROL_UI_TEXT.ACTION_FALLBACK}').trim();
        }

        vscode.postMessage({ command: button.dataset.cmd });
      });
    });

    if (typeof persisted.speed === 'number' && Number.isFinite(persisted.speed)) {
      speedInput.value = String(speedToSlider(persisted.speed));
    }
    if (typeof persisted.volume === 'number' && Number.isFinite(persisted.volume)) {
      const boundedVolume = Math.max(${READLOUD_LIMITS.VOLUME_MIN}, Math.min(${READLOUD_LIMITS.VOLUME_MAX}, persisted.volume));
      const quantizedVolume = Math.round(boundedVolume / ${READLOUD_LIMITS.VOLUME_STEP}) * ${READLOUD_LIMITS.VOLUME_STEP};
      volumeInput.value = String(quantizedVolume);
    }

    function updateSpeedLabel() {
      const speed = sliderToSpeed(speedInput.value);
      speedValue.textContent = speed.toFixed(2) + 'x';
    }

    function updateVolumeLabel() {
      volumeValue.textContent = String(volumeInput.value);
    }

    updateSpeedLabel();
    updateVolumeLabel();

    speedInput.addEventListener('input', () => {
      updateSpeedLabel();
      clearTimeout(speedTimer);
      speedTimer = setTimeout(() => {
        const speed = Number(sliderToSpeed(speedInput.value).toFixed(2));
        vscode.postMessage({ type: settingMessageType, key: speedSettingKey, value: speed });
        if (status) {
          status.textContent = '${CONTROL_UI_TEXT.SPEED_SET_PREFIX}' + speed.toFixed(2) + 'x';
        }
        vscode.setState({
          selectedByGroup,
          speed,
          volume: Number(volumeInput.value)
        });
      }, settingDebounceMs);
    });

    volumeInput.addEventListener('input', () => {
      updateVolumeLabel();
      clearTimeout(volumeTimer);
      volumeTimer = setTimeout(() => {
        const value = Number(volumeInput.value);
        vscode.postMessage({ type: settingMessageType, key: volumeSettingKey, value });
        if (status) {
          status.textContent = '${CONTROL_UI_TEXT.VOLUME_SET_PREFIX}' + value;
        }
        vscode.setState({
          selectedByGroup,
          speed: sliderToSpeed(speedInput.value),
          volume: value
        });
      }, settingDebounceMs);
    });
  </script>
</body>
</html>`;
  }
}

function isCommandMessage(value: unknown): value is CommandMessage {
  if (typeof value !== 'object' || value === null || !('command' in value)) {
    return false;
  }

  const command = (value as { command: unknown }).command;
  return typeof command === 'string' && READLOUD_COMMAND_SET.has(command as ReadLoudCommand);
}

function isSettingMessage(value: unknown): value is SettingMessage {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as { type?: unknown; key?: unknown; value?: unknown };
  return (
    candidate.type === WEBVIEW_MESSAGE_TYPES.SETTING &&
    NUMERIC_SETTING_KEYS.includes(candidate.key as NumericSettingKey) &&
    typeof candidate.value === 'number' &&
    Number.isFinite(candidate.value)
  );
}

async function updateNumericSetting(key: NumericSettingKey, value: number): Promise<void> {
  const clamped =
    key === READLOUD_SETTINGS.SPEED_MULTIPLIER
      ? Math.max(
          READLOUD_LIMITS.SPEED_MIN,
          Math.min(
            READLOUD_LIMITS.SPEED_MAX,
            quantizeToStep(Number(value), READLOUD_LIMITS.SPEED_STEP)
          )
        )
      : Math.max(
          READLOUD_LIMITS.VOLUME_MIN,
          Math.min(
            READLOUD_LIMITS.VOLUME_MAX,
            quantizeToStep(Number(value), READLOUD_LIMITS.VOLUME_STEP)
          )
        );
  await vscode.workspace.getConfiguration(READLOUD_SECTION).update(key, clamped, vscode.ConfigurationTarget.Global);
}

function quantizeToStep(value: number, step: number): number {
  const decimals = (step.toString().split('.')[1] ?? '').length;
  const quantized = Math.round(value / step) * step;
  return Number(quantized.toFixed(decimals));
}
