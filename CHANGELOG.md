# Change Log

## 0.0.4

- Added engine/voice control commands:
  - pick/set engine (`auto`, `espeak`, `speech-dispatcher`)
  - pick voice from available engine voices
  - clear voice to backend default
  - set preferred voice language
  - set speech-dispatcher voice type
- Added controls view buttons for engine and voice management.
- Added `speech-dispatcher` voice language/type argument support.
- Reordered controls groups to Start Modes -> Playback -> Speed/Volume -> Engine -> Voice.
- Added per-group selected button highlight behavior.
- Updated speed slider to multiplier mode:
  - min `0.10x`
  - default `1.00x` at center
  - max `2.00x`
- Speed slider now increments in `0.10x` steps.
- Volume slider now increments in `10` steps.
- Applying speed during active playback now takes effect immediately by restarting the current sentence.
- Added speed and volume slider controls in the controls view.
- Improved speech-dispatcher stop reliability using explicit `spd-say -S/-C`.

## 0.0.3

- Added support for additional easy text-first language ids:
  - `plaintext`
  - `restructuredtext`
  - `asciidoc`
  - `latex`
  - `org`
- Updated README and support matrix with expanded file type support details.

## 0.0.2

- Added new reading scopes:
  - from cursor to end
  - from selection to end
- Added movable compact controls view improvements with clearer click feedback and consistent button styling.
- Updated command naming/order and controls layout for clearer usage.

## 0.0.1

- Initial Ubuntu-first MVP for Markdown read-aloud.
- Added sentence, word, and line highlighting.
- Added `espeak-ng` and `speech-dispatcher` adapters.
- Added playback commands and status bar controls.
