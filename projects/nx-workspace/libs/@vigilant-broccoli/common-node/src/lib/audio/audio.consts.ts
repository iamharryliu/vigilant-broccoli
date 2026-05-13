const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

export const ELEVENLABS_ENDPOINTS = {
  SPEECH_TO_TEXT: `${ELEVENLABS_BASE_URL}/speech-to-text`,
  TEXT_TO_SPEECH: `${ELEVENLABS_BASE_URL}/text-to-speech`,
} as const;

export const ELEVENLABS_VOICES = {
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
