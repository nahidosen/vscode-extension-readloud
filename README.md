# ReadLoud Text (Ubuntu-first VS Code Extension)

Read aloud supported text files in VS Code and highlight what is being spoken.

This extension focuses on Ubuntu/Linux first and provides three simultaneous editor highlights while playing:

- current word (primary)
- current sentence (secondary)
- current line (context)

If you are new to TypeScript/VS Code extension code, see:

- `docs/PYTHON_GUIDE.md`

Support matrix (OS, languages, requirements):

- `docs/SUPPORT_MATRIX.md`

## What's new in this version

- Added voice engine control commands and controls view buttons:
  - switch engine directly (`Auto`, `eSpeak`, `Speech Dispatcher`)
  - quick-pick engine selection
- Added richer voice controls:
  - pick available voices from engine list (when available)
  - manual voice id entry fallback
  - reset to default voice
  - preferred voice language (`readLoud.voiceLanguage`)
  - speech-dispatcher voice type (`readLoud.speechDispatcher.voiceType`)
- Reordered controls groups to: Start Modes -> Playback -> Speed/Volume -> Engine -> Voice.
- Added per-group selected button state (last clicked button in each group stays highlighted).
- Added Speed Level and Volume Level slider lines in controls view.
- Speed slider now steps by `0.10x`.
- Volume slider now steps by `10`.
- Improved speech-dispatcher stop behavior with explicit stop/cancel commands.
- Added support for additional easy text file types:
  - Plain Text (`plaintext`)
  - reStructuredText (`restructuredtext`)
  - AsciiDoc (`asciidoc`)
  - LaTeX (`latex`)
  - Org (`org`)
- Added **ReadLoud Controls** webview (compact control strip).
- The controls view is **draggable inside VS Code UI** (Explorer/Sidebars/Panel).
- Added **selection-only reading** command.
- Added **start from cursor to end** mode.
- Added **start from selection to end** mode.
- Added explicit **Back** and **Forward** sentence controls in the controls view.
- Kept optional status bar controls behind `readLoud.showStatusBar`.

## Controls UI and dragging

The new UI is a compact controls view named **ReadLoud Controls**.

How to move it:

1. Open Explorer and locate "ReadLoud Controls".
2. Drag its view title to another location (Explorer, Secondary Sidebar, or Panel).

Note: VS Code does not allow arbitrary floating windows for extension controls. The view is draggable between VS Code containers, not free-floating on top of the editor.

## Features

- Reads active supported text editor content aloud.
- Optional selection-only reading (`ReadLoud: Read Selection Only`).
- Optional start from cursor to end.
- Optional start from selection to end.
- Markdown-aware prose extraction for Markdown files.
- Plain-text style extraction for other supported text languages.
- Command palette controls:
  - start from beginning
  - start from cursor to end
  - read selection only
  - start from selection to end
  - pick engine / set engine directly
  - pick voice / clear voice
  - set voice language / set speech-dispatcher voice type
  - pause / resume / stop
  - next sentence / previous sentence
- Compact controls view buttons:
  - Start modes: From Beginning, Cursor to End, Selection Only, Selection to End
  - Playback: Back, Forward, Pause, Resume, Stop
  - Engine: Auto, eSpeak, Speech Dispatcher, Pick Engine
  - Voice: Pick Voice, Default Voice, Lang, Type
- One button per group stays selected (the last clicked in that group).
- Speed and volume can be adjusted from slider lines in the controls view.
- Speed slider range is `0.10x..2.00x` in `0.10x` steps.
- Volume slider range is `0..100` in `10` steps.
- While playback is running, speed changes apply immediately by restarting the current sentence with the new speed.
- Selectable Ubuntu speech backend:
  - `espeak-ng`
  - `speech-dispatcher` (`spd-say`)
  - `auto` fallback mode
- Estimated word sync timing with configurable base WPM.

## Supported file types (current)

The extension currently reads files when VS Code language id is one of:

- `markdown`
- `plaintext`
- `restructuredtext`
- `asciidoc`
- `latex`
- `org`

Common file extension examples:

- Markdown: `.md`, `.markdown`, `.mdown`, `.mkd`, `.mkdn`, `.mdtxt`, `.mdtext`, `.rmd`
- Plain Text: `.txt`, `.text`, `.log`
- reStructuredText: `.rst`
- AsciiDoc: `.adoc`, `.asciidoc`
- LaTeX: `.tex`
- Org: `.org`

If VS Code assigns a different language id, ReadLoud will not start for that file.

## Ubuntu prerequisites

Install one or both engines:

```bash
sudo apt update
sudo apt install -y espeak-ng speech-dispatcher
```

Verify:

```bash
espeak-ng --version
spd-say --version
```

## Project setup

```bash
npm install
npm run compile
```

## Run in VS Code

1. Open this folder in VS Code.
2. Press `F5` (Run Extension).
3. In the Extension Development Host, open a supported file (`.md`, `.txt`, `.rst`, `.adoc`, `.tex`, `.org`, etc.).
4. Use Command Palette or the ReadLoud Controls view.

## Commands

- `ReadLoud: Start From Beginning` (`readLoud.start`)
- `ReadLoud: Start From Cursor To End` (`readLoud.startFromCursor`)
- `ReadLoud: Read Selection Only` (`readLoud.startSelection`)
- `ReadLoud: Start From Selection To End` (`readLoud.startSelectionToEnd`)
- `ReadLoud: Pick Engine` (`readLoud.pickEngine`)
- `ReadLoud: Use Auto Engine` (`readLoud.engineAuto`)
- `ReadLoud: Use eSpeak NG Engine` (`readLoud.engineEspeak`)
- `ReadLoud: Use Speech Dispatcher Engine` (`readLoud.engineSpeechDispatcher`)
- `ReadLoud: Pick Voice` (`readLoud.pickVoice`)
- `ReadLoud: Reset To Default Voice` (`readLoud.clearVoice`)
- `ReadLoud: Set Preferred Voice Language` (`readLoud.setVoiceLanguage`)
- `ReadLoud: Set Speech Dispatcher Voice Type` (`readLoud.setSpeechDispatcherVoiceType`)
- `ReadLoud: Pause` (`readLoud.pause`)
- `ReadLoud: Resume` (`readLoud.resume`)
- `ReadLoud: Stop` (`readLoud.stop`)
- `ReadLoud: Next Sentence` (`readLoud.nextSentence`)
- `ReadLoud: Previous Sentence` (`readLoud.previousSentence`)

## Configuration

All settings are under `readLoud.*`.

- `readLoud.engine`: `auto | espeak | speechDispatcher` (default `auto`)
- `readLoud.voice`: string voice id (default empty)
- `readLoud.voiceLanguage`: preferred language hint (e.g. `en`, `en-us`, `fr`)
- `readLoud.speechDispatcher.voiceType`: `male1|male2|male3|female1|female2|female3|child_male|child_female|''`
- `readLoud.speedMultiplier`: `0.10..2.00` (default `1.00`, step `0.10`)
- `readLoud.rate`: `0..100` (legacy setting, prefer `readLoud.speedMultiplier`)
- `readLoud.pitch`: `0..100` (default `50`)
- `readLoud.volume`: `0..100` (default `100`, step `10`)
- `readLoud.showStatusBar`: boolean (default `false`)
- `readLoud.highlight.wordColor`: CSS color string
- `readLoud.highlight.sentenceColor`: CSS color string
- `readLoud.highlight.lineColor`: CSS color string
- `readLoud.autoScroll`: boolean (default `true`)
- `readLoud.sync.baseWPM`: `80..320` (default `180`)

Example `settings.json`:

```json
{
  "readLoud.engine": "auto",
  "readLoud.voice": "en-us",
  "readLoud.voiceLanguage": "en-us",
  "readLoud.speechDispatcher.voiceType": "female1",
  "readLoud.speedMultiplier": 1.0,
  "readLoud.pitch": 52,
  "readLoud.volume": 100,
  "readLoud.showStatusBar": false,
  "readLoud.highlight.wordColor": "rgba(255,170,0,0.45)",
  "readLoud.highlight.sentenceColor": "rgba(0,170,255,0.20)",
  "readLoud.highlight.lineColor": "rgba(0,255,140,0.12)",
  "readLoud.autoScroll": true,
  "readLoud.sync.baseWPM": 180
}
```

## How playback + highlighting works

1. Parse visible prose from active text using one of four start scopes:
   - full document from beginning
   - cursor to end
   - selection only
   - selection start to end
2. Segment prose into sentence units.
3. For each sentence:
   - apply sentence highlight
   - apply line highlight
   - animate word highlight with estimated timing
   - invoke selected speech engine process
4. Move to next sentence until end or user stop.

## Back/Forward behavior

- **Back** (`Previous Sentence`): jumps to the previous sentence and starts reading from there.
- **Forward** (`Next Sentence`): jumps to the next sentence and starts reading from there.
- If playback is paused, back/forward updates focus; resume continues from the newly selected sentence.

## Testing

Run local unit tests:

```bash
npm test
```

Run VS Code integration tests:

```bash
npm run test:integration
```

## Known limitations

- Ubuntu/Linux only.
- Word highlight timing is estimated (not phoneme-accurate callbacks).
- Pausing restarts the current sentence on resume for CLI engines.
- Highlighting is in editor only (not markdown preview).
- For non-markdown types, extraction is plain text oriented (lightweight, not format-aware parsing).
