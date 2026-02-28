# ReadLoud Markdown (Ubuntu-first VS Code Extension)

Read aloud the currently open Markdown file in VS Code and highlight what is being spoken.

This extension focuses on Ubuntu/Linux first and provides three simultaneous editor highlights while playing:

- current word (primary)
- current sentence (secondary)
- current line (context)

If you are new to TypeScript/VS Code extension code, see:

- `docs/PYTHON_GUIDE.md`

Support matrix (OS, languages, requirements):

- `docs/SUPPORT_MATRIX.md`

## What's new in this version

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

- Reads active Markdown editor content aloud.
- Optional selection-only reading (`ReadLoud: Start From Selection`).
- Optional start from cursor to end.
- Optional start from selection to end.
- Prose-first extraction (headings, paragraphs, list text).
- Skips frontmatter, code fences, tables, and HTML blocks.
- Command palette controls:
  - start from beginning
  - start from cursor to end
  - read selection only
  - start from selection to end
  - pause / resume / stop
  - next sentence / previous sentence
- Compact controls view buttons:
  - Start, Selection, Back, Forward, Pause, Resume, Stop
- Selectable Ubuntu speech backend:
  - `espeak-ng`
  - `speech-dispatcher` (`spd-say`)
  - `auto` fallback mode
- Estimated word sync timing with configurable base WPM.

## Supported file types (current)

The extension currently reads files that VS Code recognizes as **Markdown** (`languageId: markdown`).

Common examples:

- `.md`
- `.markdown`
- `.mdown`
- `.mkd`
- `.mkdn`
- `.mdtxt`
- `.mdtext`
- `.rmd`

If a file is not detected as Markdown in VS Code, ReadLoud will not start for that file.

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
3. In the Extension Development Host, open a `.md` file.
4. Use Command Palette or the ReadLoud Controls view.

## Commands

- `ReadLoud: Start` (`readLoud.start`)
- `ReadLoud: Start From Cursor To End` (`readLoud.startFromCursor`)
- `ReadLoud: Read Selection Only` (`readLoud.startSelection`)
- `ReadLoud: Start From Selection To End` (`readLoud.startSelectionToEnd`)
- `ReadLoud: Pause` (`readLoud.pause`)
- `ReadLoud: Resume` (`readLoud.resume`)
- `ReadLoud: Stop` (`readLoud.stop`)
- `ReadLoud: Next Sentence` (`readLoud.nextSentence`)
- `ReadLoud: Previous Sentence` (`readLoud.previousSentence`)

## Configuration

All settings are under `readLoud.*`.

- `readLoud.engine`: `auto | espeak | speechDispatcher` (default `auto`)
- `readLoud.voice`: string voice id (default empty)
- `readLoud.rate`: `0..100` (default `50`)
- `readLoud.pitch`: `0..100` (default `50`)
- `readLoud.volume`: `0..100` (default `100`)
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
  "readLoud.rate": 55,
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

1. Parse visible prose from active markdown text using one of four start scopes:
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
- Complex markdown constructs are intentionally skipped in this MVP.
