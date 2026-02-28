# Support Matrix, Dependencies, and Requirements

## Operating System Support

- Linux: Supported (Ubuntu-focused and tested)
- macOS: Not supported in current build
- Windows: Not supported in current build

The extension currently enforces Linux at runtime (`process.platform === 'linux'`).

## File Type Support

- Supported language ids:
  - `markdown`
  - `plaintext`
  - `restructuredtext`
  - `asciidoc`
  - `latex`
  - `org`

Common extensions by language:

- Markdown: `.md`, `.markdown`, `.mdown`, `.mkd`, `.mkdn`, `.mdtxt`, `.mdtext`, `.rmd`
- Plain Text: `.txt`, `.text`, `.log`
- reStructuredText: `.rst`
- AsciiDoc: `.adoc`, `.asciidoc`
- LaTeX: `.tex`
- Org: `.org`

If VS Code assigns a different language id, the extension will not start playback for that file.

## Speech Engine Support

- `espeak-ng`: Supported
- `speech-dispatcher` via `spd-say`: Supported
- Engine mode `auto`: Supported (picks first available engine)

## Language Support

Language support depends on installed voices in your Linux environment.

### `espeak-ng` language/voice codes detected on this machine

| Code                 | Name                                   |
| -------------------- | -------------------------------------- |
| `af`                 | Afrikaans                              |
| `am`                 | Amharic                                |
| `an`                 | Aragonese                              |
| `ar`                 | Arabic                                 |
| `as`                 | Assamese                               |
| `az`                 | Azerbaijani                            |
| `ba`                 | Bashkir                                |
| `be`                 | Belarusian                             |
| `bg`                 | Bulgarian                              |
| `bn`                 | Bengali                                |
| `bpy`                | Bishnupriya_Manipuri                   |
| `bs`                 | Bosnian                                |
| `ca`                 | Catalan                                |
| `chr-US-Qaaa-x-west` | Cherokee\_                             |
| `cmn`                | Chinese\_(Mandarin,\_latin_as_English) |
| `cmn-latn-pinyin`    | Chinese\_(Mandarin,\_latin_as_Pinyin)  |
| `cs`                 | Czech                                  |
| `cv`                 | Chuvash                                |
| `cy`                 | Welsh                                  |
| `da`                 | Danish                                 |
| `de`                 | German                                 |
| `el`                 | Greek                                  |
| `en-029`             | English\_(Caribbean)                   |
| `en-gb`              | English\_(Great_Britain)               |
| `en-gb-scotland`     | English\_(Scotland)                    |
| `en-gb-x-gbclan`     | English\_(Lancaster)                   |
| `en-gb-x-gbcwmd`     | English\_(West_Midlands)               |
| `en-gb-x-rp`         | English\_(Received_Pronunciation)      |
| `en-us`              | English\_(America)                     |
| `en-us-nyc`          | English\_(America,\_New_York_City)     |
| `eo`                 | Esperanto                              |
| `es`                 | Spanish\_(Spain)                       |
| `es-419`             | Spanish\_(Latin_America)               |
| `et`                 | Estonian                               |
| `eu`                 | Basque                                 |
| `fa`                 | Persian                                |
| `fa-latn`            | Persian\_(Pinglish)                    |
| `fi`                 | Finnish                                |
| `fr-be`              | French\_(Belgium)                      |
| `fr-ch`              | French\_(Switzerland)                  |
| `fr-fr`              | French\_(France)                       |
| `ga`                 | Gaelic\_(Irish)                        |
| `gd`                 | Gaelic\_(Scottish)                     |
| `gn`                 | Guarani                                |
| `grc`                | Greek\_(Ancient)                       |
| `gu`                 | Gujarati                               |
| `hak`                | Hakka_Chinese                          |
| `haw`                | Hawaiian                               |
| `he`                 | Hebrew                                 |
| `hi`                 | Hindi                                  |
| `hr`                 | Croatian                               |
| `ht`                 | Haitian_Creole                         |
| `hu`                 | Hungarian                              |
| `hy`                 | Armenian\_(East_Armenia)               |
| `hyw`                | Armenian\_(West_Armenia)               |
| `ia`                 | Interlingua                            |
| `id`                 | Indonesian                             |
| `io`                 | Ido                                    |
| `is`                 | Icelandic                              |
| `it`                 | Italian                                |
| `ja`                 | Japanese                               |
| `jbo`                | Lojban                                 |
| `ka`                 | Georgian                               |
| `kk`                 | Kazakh                                 |
| `kl`                 | Greenlandic                            |
| `kn`                 | Kannada                                |
| `ko`                 | Korean                                 |
| `kok`                | Konkani                                |
| `ku`                 | Kurdish                                |
| `ky`                 | Kyrgyz                                 |
| `la`                 | Latin                                  |
| `lb`                 | Luxembourgish                          |
| `lfn`                | Lingua_Franca_Nova                     |
| `lt`                 | Lithuanian                             |
| `ltg`                | Latgalian                              |
| `lv`                 | Latvian                                |
| `mi`                 | Māori                                  |
| `mk`                 | Macedonian                             |
| `ml`                 | Malayalam                              |
| `mr`                 | Marathi                                |
| `ms`                 | Malay                                  |
| `mt`                 | Maltese                                |
| `my`                 | Myanmar\_(Burmese)                     |
| `nb`                 | Norwegian_Bokmål                       |
| `nci`                | Nahuatl\_(Classical)                   |
| `ne`                 | Nepali                                 |
| `nl`                 | Dutch                                  |
| `nog`                | Nogai                                  |
| `om`                 | Oromo                                  |
| `or`                 | Oriya                                  |
| `pa`                 | Punjabi                                |
| `pap`                | Papiamento                             |
| `piqd`               | Klingon                                |
| `pl`                 | Polish                                 |
| `pt`                 | Portuguese\_(Portugal)                 |
| `pt-br`              | Portuguese\_(Brazil)                   |
| `py`                 | Pyash                                  |
| `qdb`                | Lang_Belta                             |
| `qu`                 | Quechua                                |
| `quc`                | K'iche'                                |
| `qya`                | Quenya                                 |
| `ro`                 | Romanian                               |
| `ru`                 | Russian                                |
| `ru-lv`              | Russian\_(Latvia)                      |
| `sd`                 | Sindhi                                 |
| `shn`                | Shan\_(Tai_Yai)                        |
| `si`                 | Sinhala                                |
| `sjn`                | Sindarin                               |
| `sk`                 | Slovak                                 |
| `sl`                 | Slovenian                              |
| `smj`                | Lule_Saami                             |
| `sq`                 | Albanian                               |
| `sr`                 | Serbian                                |
| `sv`                 | Swedish                                |
| `sw`                 | Swahili                                |
| `ta`                 | Tamil                                  |
| `te`                 | Telugu                                 |
| `th`                 | Thai                                   |
| `tk`                 | Turkmen                                |
| `tn`                 | Setswana                               |
| `tr`                 | Turkish                                |
| `tt`                 | Tatar                                  |
| `ug`                 | Uyghur                                 |
| `uk`                 | Ukrainian                              |
| `ur`                 | Urdu                                   |
| `uz`                 | Uzbek                                  |
| `vi`                 | Vietnamese\_(Northern)                 |
| `vi-vn-x-central`    | Vietnamese\_(Central)                  |
| `vi-vn-x-south`      | Vietnamese\_(Southern)                 |
| `yue`                | Chinese\_(Cantonese)                   |

### `speech-dispatcher` voice/language support

`spd-say` support depends on your speech-dispatcher modules and installed system voices.
To inspect your machine:

```bash
spd-say -L
```

## Runtime and Build Requirements

- VS Code: `>= 1.109`
- Node.js: `>= 20` recommended
- npm: modern npm (v10+ recommended)
- Linux packages:
  - `espeak-ng` and/or
  - `speech-dispatcher`

Install dependencies:

```bash
npm install
```

Compile:

```bash
npm run compile
```

Unit tests:

```bash
npm test
```

Integration tests (requires VS Code test binary download):

```bash
npm run test:integration
```

## How It Works (Runtime)

1. User starts playback from command palette or controls view.
2. Extension reads settings from `readLoud.*`.
3. Prose text is extracted and segmented into sentences/words (markdown-aware rules for markdown, plain-line rules for other supported text types).
4. For each sentence:
   - sentence + line highlight applied
   - word highlight animated with estimated timing
   - selected speech engine speaks the sentence
5. Playback stops at end, on user stop, on editor switch, or on document edits.

## Key Dependencies in Code

- `vscode` API (editor integration, commands, decorations, view provider)
- Node `child_process` (launch/stop TTS CLI processes)
- `Intl.Segmenter` (sentence segmentation when available)
