const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

export const ELEVENLABS_ENDPOINTS = {
  SPEECH_TO_TEXT: `${ELEVENLABS_BASE_URL}/speech-to-text`,
  TEXT_TO_SPEECH: `${ELEVENLABS_BASE_URL}/text-to-speech`,
} as const;

export const ELEVENLABS_VOICES = {
  GEORGE: 'JBFqnCBsd6RMkjVDRZzb',
  ARIA: '9BWtsMINqrJLrRacOk9x',
  ROGER: 'CwhRBWXHgx4WhNpiEJuK',
  SARAH: 'EXAVITQu4vr4xnSDxMaL',
  LAURA: 'FGY2WhTYpPnrIDTdsKH5',
  CHARLIE: 'IKne3meq5aSn9XLyUdCD',
  CALLUM: 'N2lVS1w4EtoT3dr4eOWO',
  RIVER: 'SAz9YHcvj6GT2YYXdXww',
  LIAM: 'TX3LPaxmHKxFdv7VOQHJ',
  CHARLOTTE: 'XB0fDUnXU5powFXDhCwa',
  ALICE: 'Xb7hH8MSUJpSbSDYk0k2',
  MATILDA: 'XrExE9yKIg1WjnnlVkGX',
  WILL: 'bIHbv24MWmeRgasZH58o',
  JESSICA: 'cgSgspJ2msm6clMCkdW9',
  ERIC: 'cjVigY5qzO86Huf0OWal',
  CHRIS: 'iP95p4xoKVk53GoZ742B',
  BRIAN: 'nPczCjzI2devNBz1zQrb',
  DANIEL: 'onwK4e9ZLuTAKqWW03F9',
  LILY: 'pFZP5JQG7iQjIQuC4Bku',
  BILL: 'pqHfZKP75CvOlQylNhV4',
  DEFAULT: 'JBFqnCBsd6RMkjVDRZzb',
} as const;

export const ELEVENLABS_TTS_MODELS = {
  MULTILINGUAL_V2: 'eleven_multilingual_v2',
} as const;

export const ELEVENLABS_TTS_OUTPUT_FORMATS = {
  MP3_44100_128: 'mp3_44100_128',
} as const;

export const ELEVENLABS_STT_MODELS = {
  V1: 'scribe_v1',
  V2: 'scribe_v2',
} as const;

export const ELEVENLABS_LANGUAGES = {
  ENGLISH: 'eng',
  SPANISH: 'es',
  FRENCH: 'fr',
  GERMAN: 'de',
  ITALIAN: 'it',
  PORTUGUESE: 'pt',
  DUTCH: 'nl',
  POLISH: 'pl',
  RUSSIAN: 'ru',
  JAPANESE: 'ja',
  CHINESE: 'zh',
  KOREAN: 'ko',
} as const;
