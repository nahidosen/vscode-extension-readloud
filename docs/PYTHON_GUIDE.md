# ReadLoud Codebase Guide (for Python Developers)

This file explains the VS Code extension as if it were a Python app.

## 1) Big picture

Think of this extension as a small async application with this pipeline:

1. User runs command (`start`, `pause`, etc.)
2. Controller loads config and validates environment
3. Markdown text is parsed into sentence units and word ranges
4. TTS engine process speaks one sentence at a time
5. UI decorations highlight sentence, line, and current word
6. Repeat until finished or stopped

Python analogy:
- `src/extension.ts` is like your `main.py` entrypoint + CLI command registration
- `src/playbackController.ts` is like your central service class (`PlayerService`)
- `src/tts/*` is like strategy classes around `subprocess.Popen`
- `src/markdownCore.ts` is pure text-processing utility module
- `src/highlighting.ts` is UI rendering layer
- `src/controlsView.ts` is a compact draggable control surface (webview)

## 2) Files and what each one does

## Core runtime

- `src/extension.ts`
  - VS Code entrypoint (`activate`)
  - Creates controller + dependencies
  - Registers commands
  - Subscribes to editor/config/document events

- `src/playbackController.ts`
  - Main orchestrator and state machine
  - States: `idle`, `playing`, `paused`, `stopping`
  - Handles multiple start scopes:
    - beginning
    - cursor to end
    - selection only
    - selection to end
  - Also handles pause/resume/stop/next/previous
  - Stops playback if editor changes or file changes

- `src/config.ts`
  - Reads `readLoud.*` settings from VS Code
  - Clamps numeric ranges (rate/pitch/volume/WPM)

- `src/types.ts`
  - Shared TypeScript interfaces and types
  - Similar role to Python `typing`/`dataclasses` schema definitions

## Text parsing and timing

- `src/markdownCore.ts`
  - Pure parser utilities (no VS Code dependency)
  - Removes unsupported markdown regions (frontmatter, fenced code, tables, html blocks)
  - Splits prose into sentence spans and word spans

- `src/markdown.ts`
  - Converts parser spans into VS Code `Range`s
  - Produces `SentenceUnit[]` with sentence range + line range + word ranges

- `src/timing.ts`
  - Estimates sentence duration from words-per-minute
  - Splits sentence duration into per-word durations

## TTS engine abstraction

- `src/tts/baseAdapter.ts`
  - Abstract base class around process lifecycle
  - Spawns process and supports cancellation via `AbortSignal`

- `src/tts/espeakAdapter.ts`
  - Maps normalized config (`0..100`) to `espeak-ng` args

- `src/tts/speechDispatcherAdapter.ts`
  - Maps normalized config (`0..100`) to `spd-say` args

- `src/tts/engineSelector.ts`
  - Chooses engine by config (`auto` or explicit)
  - Fallback behavior when configured engine unavailable

- `src/tts/processUtils.ts`
  - `command -v` check
  - `spawn()` helper
  - safe `SIGTERM` kill helper

## UI

- `src/highlighting.ts`
  - Manages three decoration types
  - sentence highlight
  - word highlight
  - line highlight
  - Performs word-by-word animation using delays

- `src/statusBar.ts`
  - Status bar controls and icons based on playback state

- `src/controlsView.ts`
  - Compact webview buttons for Start/Selection/Back/Forward/Pause/Resume/Stop
  - View can be dragged between VS Code containers (Explorer/Sidebars/Panel)

## Tests

- `src/test/suite/*.test.ts`
  - parser/timing/adapter tests (unit)
  - integration command-registration test (VS Code host)

## 3) End-to-end flow (step by step)

When user runs `ReadLoud: Start`:

1. `extension.ts` routes command to `controller.start()`
2. `start()` validates active editor is markdown and OS is Linux
3. Config is loaded from `config.ts`
4. Engine is selected with `selectEngine()`
5. Markdown is parsed into sentence units (`buildSentenceUnits()`)
6. State becomes `playing` and run loop begins
7. For each sentence:
   - apply sentence + line highlight
   - estimate timings
   - animate word highlight asynchronously
   - call adapter `speakSentence()` (CLI process)
8. After sentence completes, index advances
9. End of list => clear highlights, return to `idle`

Python analogy for run loop:

```python
while state == "playing" and idx < len(sentences):
    highlight_sentence(sentences[idx])
    animate_words(sentences[idx])
    tts_engine.speak(sentences[idx].text)
    idx += 1
```

with cancellation token semantics layered in.

## 4) TypeScript concepts mapped to Python

- `interface` -> Python `Protocol` or informal typed dict/dataclass contract
- `type A = 'x' | 'y'` -> `Literal['x', 'y']`
- `Promise<void>` + `async/await` -> `async def` coroutine
- `AbortController/AbortSignal` -> cancellation token / asyncio task cancellation flag
- `Disposable` -> context-managed resource needing `.close()`/cleanup

## 5) Where to edit for common changes

- Add a new command:
  - `package.json` (`contributes.commands` + activation events)
  - `src/extension.ts` command registration
  - `src/playbackController.ts` implementation

- Change parsing behavior:
  - `src/markdownCore.ts` regex/state logic
  - `src/markdown.ts` if range mapping changes

- Change highlight colors or style defaults:
  - defaults in `package.json` config
  - rendering behavior in `src/highlighting.ts`

- Add a new TTS backend:
  - create new adapter in `src/tts/`
  - add it to adapter list in `extension.ts`
  - support its id in types/settings

## 6) Known design constraints

- Ubuntu/Linux only (`process.platform === 'linux'` check)
- Word timing is estimated, not true phoneme timing
- Pause/resume is process-based, not precise audio-frame pause
- Editing the source document during playback stops playback

## 7) How to run and debug quickly

```bash
npm install
npm run compile
npm test
```

Then in VS Code:

1. Press `F5`
2. Open markdown file in Extension Development Host
3. Run `ReadLoud: Start`

If speech does not start, verify binaries:

```bash
espeak-ng --version
spd-say --version
```

## 8) If this were a Python project structure

Approximate mental mapping:

- `app/main.py` -> `src/extension.ts`
- `app/services/player.py` -> `src/playbackController.ts`
- `app/services/tts/base.py` -> `src/tts/baseAdapter.ts`
- `app/services/tts/espeak.py` -> `src/tts/espeakAdapter.ts`
- `app/parsing/markdown.py` -> `src/markdownCore.ts`
- `app/ui/highlight.py` -> `src/highlighting.ts`
- `app/config.py` -> `src/config.ts`
- `tests/` -> `src/test/suite/`

Once you see it as controller + adapters + parser + UI layer, the codebase is straightforward.
