# ReadLoud Markdown (Ubuntu-first VS Code Extension)

Read aloud the currently open Markdown file in VS Code and highlight what is being spoken.

This extension focuses on Ubuntu/Linux first and provides three simultaneous editor highlights while playing:
- current word (primary)
- current sentence (secondary)
- current line (context)

## Features

- Reads active Markdown editor content aloud.
- Prose-first extraction (headings, paragraphs, list text).
- Skips frontmatter, code fences, tables, and HTML blocks.
- Command palette controls: start, pause, resume, stop, next sentence, previous sentence.
- Status bar controls for quick play/pause/resume/stop.
- Selectable Ubuntu speech backend:
  - `espeak-ng`
  - `speech-dispatcher` (`spd-say`)
  - `auto` fallback mode
- Estimated word sync timing with configurable base WPM.

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

This repository follows the official TypeScript VS Code extension template structure.

If you have network access and want to regenerate from the official generator:

```bash
npm install -g yo generator-code
yo code
```

For this repository as-is:

```bash
npm install
npm run compile
```

## Run in VS Code

1. Open this folder in VS Code.
2. Press `F5` (Run Extension).
3. In the Extension Development Host, open a `.md` file.
4. Run `ReadLoud: Start` from Command Palette.

## Commands

- `ReadLoud: Start` (`readLoud.start`)
- `ReadLoud: Pause` (`readLoud.pause`)
- `ReadLoud: Resume` (`readLoud.resume`)
- `ReadLoud: Stop` (`readLoud.stop`)
- `ReadLoud: Next Sentence` (`readLoud.nextSentence`)
- `ReadLoud: Previous Sentence` (`readLoud.previousSentence`)

## Configuration

All settings are under the `readLoud.*` namespace.

- `readLoud.engine`: `auto | espeak | speechDispatcher` (default `auto`)
- `readLoud.voice`: string voice id (default empty)
- `readLoud.rate`: `0..100` (default `50`)
- `readLoud.pitch`: `0..100` (default `50`)
- `readLoud.volume`: `0..100` (default `100`)
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
  "readLoud.highlight.wordColor": "rgba(255,170,0,0.45)",
  "readLoud.highlight.sentenceColor": "rgba(0,170,255,0.20)",
  "readLoud.highlight.lineColor": "rgba(0,255,140,0.12)",
  "readLoud.autoScroll": true,
  "readLoud.sync.baseWPM": 180
}
```

## How playback + highlighting works

1. Parse visible prose from the active Markdown document.
2. Segment prose into sentence units.
3. For each sentence:
   - apply sentence highlight
   - apply line highlight
   - animate word highlight using estimated timing
   - invoke selected speech engine process
4. Move to next sentence until end or user stop.

## Implementation map

- `src/extension.ts`: activation and command wiring
- `src/playbackController.ts`: playback state machine and lifecycle
- `src/markdown.ts`: prose extraction + segmentation + range mapping
- `src/highlighting.ts`: editor decorations and word animation
- `src/tts/*`: speech engine adapters + selector
- `src/timing.ts`: sentence/word duration estimation
- `src/statusBar.ts`: status bar controls

## Testing

Run local unit tests (offline-friendly):

```bash
npm test
```

Run VS Code integration tests (downloads VS Code test binary if not cached):

```bash
npm run test:integration
```

Current test suite includes:
- Markdown extraction behavior
- Sentence and word segmentation helpers
- Timing estimator checks
- Engine argument mapping checks
- Basic command registration/invocation integration checks (`test:integration`)

## Known limitations (v1)

- Ubuntu/Linux only.
- Word highlight timing is estimated (not engine callback accurate).
- Pausing restarts the current sentence on resume for CLI engines.
- Highlighting is in editor only (not Markdown preview).
- Complex Markdown constructs are intentionally skipped in this MVP.

## Troubleshooting

- `No supported speech engine found`:
  - install `espeak-ng` and/or `speech-dispatcher`
  - ensure binaries are in `PATH`
- No text is read:
  - ensure active editor is Markdown
  - ensure file has prose outside code fences/tables/frontmatter
- Playback stops unexpectedly:
  - editing document or switching active editor intentionally stops playback

## Roadmap

- More accurate word sync using engine events/audio timing.
- Optional Markdown preview highlight support.
- Better pause/resume semantics with engines that support it.
- Additional OS support after Ubuntu stabilization.
