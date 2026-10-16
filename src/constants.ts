export const READLOUD_SECTION = 'readLoud';
export const READLOUD_VIEW_TYPE = 'readLoud.controls';

export const READLOUD_COMMANDS = {
  START: 'readLoud.start',
  START_FROM_CURSOR: 'readLoud.startFromCursor',
  START_SELECTION: 'readLoud.startSelection',
  START_SELECTION_TO_END: 'readLoud.startSelectionToEnd',
  PICK_ENGINE: 'readLoud.pickEngine',
  ENGINE_AUTO: 'readLoud.engineAuto',
  ENGINE_ESPEAK: 'readLoud.engineEspeak',
  ENGINE_SPEECH_DISPATCHER: 'readLoud.engineSpeechDispatcher',
  PICK_VOICE: 'readLoud.pickVoice',
  CLEAR_VOICE: 'readLoud.clearVoice',
  SET_VOICE_LANGUAGE: 'readLoud.setVoiceLanguage',
  SET_SPEECH_DISPATCHER_VOICE_TYPE: 'readLoud.setSpeechDispatcherVoiceType',
  PAUSE: 'readLoud.pause',
  RESUME: 'readLoud.resume',
  STOP: 'readLoud.stop',
  NEXT_SENTENCE: 'readLoud.nextSentence',
  PREVIOUS_SENTENCE: 'readLoud.previousSentence'
} as const;

export type ReadLoudCommand = (typeof READLOUD_COMMANDS)[keyof typeof READLOUD_COMMANDS];

export const READLOUD_COMMAND_LIST: ReadLoudCommand[] = Object.values(READLOUD_COMMANDS);
export const READLOUD_COMMAND_SET = new Set<ReadLoudCommand>(READLOUD_COMMAND_LIST);

export const ENGINE_SETTINGS = ['auto', 'espeak', 'speechDispatcher'] as const;
export const RESOLVED_ENGINES = ['espeak', 'speechDispatcher'] as const;
export const ENGINE_VALUES = {
  AUTO: ENGINE_SETTINGS[0],
  ESPEAK: RESOLVED_ENGINES[0],
  SPEECH_DISPATCHER: RESOLVED_ENGINES[1]
} as const;
export const ENGINE_DISPLAY_NAMES = {
  auto: 'Auto',
  espeak: 'eSpeak NG',
  speechDispatcher: 'Speech Dispatcher'
} as const;

export const SPEECH_DISPATCHER_VOICE_TYPES = [
  '',
  'male1',
  'male2',
  'male3',
  'female1',
  'female2',
  'female3',
  'child_male',
  'child_female'
] as const;

export const READLOUD_SETTINGS = {
  ENGINE: 'engine',
  VOICE: 'voice',
  VOICE_LANGUAGE: 'voiceLanguage',
  SPEECH_DISPATCHER_VOICE_TYPE: 'speechDispatcher.voiceType',
  SPEED_MULTIPLIER: 'speedMultiplier',
  RATE: 'rate',
  PITCH: 'pitch',
  VOLUME: 'volume',
  SHOW_STATUS_BAR: 'showStatusBar',
  AUTO_SCROLL: 'autoScroll',
  SYNC_BASE_WPM: 'sync.baseWPM',
  HIGHLIGHT_WORD_COLOR: 'highlight.wordColor',
  HIGHLIGHT_SENTENCE_COLOR: 'highlight.sentenceColor',
  HIGHLIGHT_LINE_COLOR: 'highlight.lineColor'
} as const;

export const READLOUD_DEFAULTS = {
  ENGINE: 'auto',
  VOICE: '',
  VOICE_LANGUAGE: '',
  SPEECH_DISPATCHER_VOICE_TYPE: '',
  SPEED_MULTIPLIER: 1.0,
  RATE: 50,
  PITCH: 50,
  VOLUME: 100,
  SHOW_STATUS_BAR: false,
  AUTO_SCROLL: true,
  SYNC_BASE_WPM: 180,
  HIGHLIGHT_WORD_COLOR: 'rgba(255, 170, 0, 0.45)',
  HIGHLIGHT_SENTENCE_COLOR: 'rgba(0, 170, 255, 0.20)',
  HIGHLIGHT_LINE_COLOR: 'rgba(0, 255, 140, 0.12)'
} as const;

export const READLOUD_LIMITS = {
  RATE_MIN: 0,
  RATE_MAX: 100,
  RATE_MID: 50,
  SPEED_MIN: 0.1,
  SPEED_MAX: 2.0,
  SPEED_STEP: 0.1,
  SPEED_MID: 1.0,
  VOLUME_MIN: 0,
  VOLUME_MAX: 100,
  VOLUME_STEP: 10,
  SYNC_BASE_WPM_MIN: 80,
  SYNC_BASE_WPM_MAX: 320
} as const;

export const CONTROL_GROUPS = {
  START: 'start',
  PLAYBACK: 'playback',
  ENGINE: 'engine',
  VOICE: 'voice'
} as const;

export const CONTROL_DEFAULT_SELECTION = {
  [CONTROL_GROUPS.START]: READLOUD_COMMANDS.START,
  [CONTROL_GROUPS.PLAYBACK]: READLOUD_COMMANDS.STOP,
  [CONTROL_GROUPS.ENGINE]: READLOUD_COMMANDS.ENGINE_AUTO,
  [CONTROL_GROUPS.VOICE]: READLOUD_COMMANDS.CLEAR_VOICE
} as const;

export const CONTROL_SLIDER_RANGES = {
  SPEED_MIN: -9,
  SPEED_MAX: 10,
  SPEED_STEP: 1,
  SPEED_DEFAULT: 0,
  VOLUME_MIN: READLOUD_LIMITS.VOLUME_MIN,
  VOLUME_MAX: READLOUD_LIMITS.VOLUME_MAX,
  VOLUME_STEP: READLOUD_LIMITS.VOLUME_STEP,
  VOLUME_DEFAULT: READLOUD_DEFAULTS.VOLUME
} as const;

export const CONTROL_UI_TEXT = {
  READY: 'Ready.',
  COMMAND_SENT_PREFIX: 'Command sent: ',
  ACTION_FALLBACK: 'Action',
  SPEED_SET_PREFIX: 'Speed level set to ',
  VOLUME_SET_PREFIX: 'Volume level set to ',
  MOVE_HINT: 'Drag this "ReadLoud Controls" view by its title to move it across Explorer, Sidebars, or Panel.'
} as const;

export const CONTROL_UI_TIMINGS_MS = {
  BUTTON_PRESSED: 140,
  SETTING_DEBOUNCE: 120
} as const;

export const PLAYBACK_TIMINGS_MS = {
  LIVE_CONFIG_RESTART_DEBOUNCE: 180
} as const;

export const WEBVIEW_MESSAGE_TYPES = {
  SETTING: 'setting'
} as const;

export const NUMERIC_SETTING_KEYS = [READLOUD_SETTINGS.SPEED_MULTIPLIER, READLOUD_SETTINGS.VOLUME] as const;

export const SUPPORTED_LANGUAGE_IDS = [
  'markdown',
  'plaintext',
  'restructuredtext',
  'asciidoc',
  'latex',
  'org'
] as const;
export const MARKDOWN_LANGUAGE_ID = 'markdown';

export const SUPPORTED_PLATFORM = 'linux';
export const SUPPORTED_PLATFORM_LABEL = 'Ubuntu/Linux';

export const TIMING_LIMITS = {
  MIN_SENTENCE_DURATION_MS: 350,
  MIN_WORD_DURATION_MS: 60
} as const;

export const HIGHLIGHTING = {
  DEFAULT_WORD_DURATION_MS: 120
} as const;

export const TIMING_REGEX = {
  WORD: /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu
} as const;

export const MARKDOWN_REGEX = {
  FENCE: /^\s*(```|~~~)/,
  TABLE_SEPARATOR: /^\s*\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)+\|?\s*$/,
  HTML_BLOCK_START: /^\s*<(?!\/)([A-Za-z][A-Za-z0-9-]*)(\s+[^>]*)?>\s*$/,
  HTML_BLOCK_END: /^\s*<\/[A-Za-z][A-Za-z0-9-]*>\s*$/,
  SENTENCE_FALLBACK: /[^.!?]+[.!?]*/g
} as const;

export const STATUS_BAR = {
  PRIMARY_PRIORITY: 100,
  STOP_PRIORITY: 99,
  PRIMARY_NAME: 'ReadLoud',
  STOP_NAME: 'ReadLoud Stop'
} as const;

export const TTS_BINARIES = {
  ESPEAK: 'espeak-ng',
  SPEECH_DISPATCHER: 'spd-say'
} as const;

export const TTS_ARGS = {
  ESPEAK_LIST_VOICES: '--voices',
  ESPEAK_SPEED: '-s',
  ESPEAK_PITCH: '-p',
  ESPEAK_AMPLITUDE: '-a',
  ESPEAK_VOICE: '-v',
  SPEECH_DISPATCHER_LIST_VOICES: '-L',
  SPEECH_DISPATCHER_WAIT: '-w',
  SPEECH_DISPATCHER_RATE: '-r',
  SPEECH_DISPATCHER_PITCH: '-p',
  SPEECH_DISPATCHER_VOLUME: '-i',
  SPEECH_DISPATCHER_LANGUAGE: '-l',
  SPEECH_DISPATCHER_VOICE_TYPE: '-t',
  SPEECH_DISPATCHER_VOICE: '-y',
  SPEECH_DISPATCHER_STOP: '-S',
  SPEECH_DISPATCHER_CANCEL: '-C'
} as const;

export const ESPEAK_LIMITS = {
  MIN_WPM: 80,
  WPM_SPAN: 300,
  PITCH_MAX: 99,
  AMPLITUDE_MAX: 200
} as const;

export const SIGNED_PERCENT = {
  MIDPOINT: 50,
  MULTIPLIER: 2
} as const;
