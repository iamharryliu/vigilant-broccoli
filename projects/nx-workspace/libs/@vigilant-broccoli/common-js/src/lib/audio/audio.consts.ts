export const ELEVENLABS_FREE_VOICE_OPTIONS = [
  { label: 'George', value: 'JBFqnCBsd6RMkjVDRZzb' },
  { label: 'Sarah', value: 'EXAVITQu4vr4xnSDxMaL' },
  { label: 'Laura', value: 'FGY2WhTYpPnrIDTdsKH5' },
  { label: 'Charlie', value: 'IKne3meq5aSn9XLyUdCD' },
  { label: 'Callum', value: 'N2lVS1w4EtoT3dr4eOWO' },
  { label: 'Liam', value: 'TX3LPaxmHKxFdv7VOQHJ' },
  { label: 'Alice', value: 'Xb7hH8MSUJpSbSDYk0k2' },
  { label: 'Matilda', value: 'XrExE9yKIg1WjnnlVkGX' },
  { label: 'Will', value: 'bIHbv24MWmeRgasZH58o' },
  { label: 'Jessica', value: 'cgSgspJ2msm6clMCkdW9' },
  { label: 'Eric', value: 'cjVigY5qzO86Huf0OWal' },
  { label: 'Chris', value: 'iP95p4xoKVk53GoZ742B' },
  { label: 'Brian', value: 'nPczCjzI2devNBz1zQrb' },
  { label: 'Daniel', value: 'onwK4e9ZLuTAKqWW03F9' },
  { label: 'Lily', value: 'pFZP5JQG7iQjIQuC4Bku' },
  { label: 'Bill', value: 'pqHfZKP75CvOlQylNhV4' },
] as const;

export const ELEVENLABS_PAID_VOICE_OPTIONS = [
  { label: 'Aria', value: '9BWtsMINqrJLrRacOk9x' },
  { label: 'Roger', value: 'CwhRBWXHgx4WhNpiEJuK' },
  { label: 'River', value: 'SAz9YHcvj6GT2YYXdXww' },
  { label: 'Charlotte', value: 'XB0fDUnXU5powFXDhCwa' },
] as const;

export const ELEVENLABS_VOICE_OPTIONS = [
  ...ELEVENLABS_FREE_VOICE_OPTIONS,
  ...ELEVENLABS_PAID_VOICE_OPTIONS,
] as const;

export const DEFAULT_VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb';
