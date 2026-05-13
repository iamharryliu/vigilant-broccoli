import {
  ELEVENLABS_ENDPOINTS,
  ELEVENLABS_VOICES,
  ELEVENLABS_TTS_MODELS,
  ELEVENLABS_TTS_OUTPUT_FORMATS,
  ELEVENLABS_STT_MODELS,
  ELEVENLABS_LANGUAGES,
} from './audio.consts';

interface TextToSpeechOptions {
  voiceId?: string;
  modelId?: string;
  outputFormat?: string;
}

const DEFAULT_TTS_OPTIONS: Required<TextToSpeechOptions> = {
  voiceId: ELEVENLABS_VOICES.DEFAULT,
  modelId: ELEVENLABS_TTS_MODELS.MULTILINGUAL_V2,
  outputFormat: ELEVENLABS_TTS_OUTPUT_FORMATS.MP3_44100_128,
};

interface TranscribeOptions {
  modelId?: string;
  diarize?: boolean;
  tagAudioEvents?: boolean;
  languageCode?: string;
}

const DEFAULT_OPTIONS: Required<TranscribeOptions> = {
  modelId: ELEVENLABS_STT_MODELS.V2,
  diarize: false,
  tagAudioEvents: false,
  languageCode: ELEVENLABS_LANGUAGES.ENGLISH,
};

const getApiKey = () => {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error('ELEVENLABS_API_KEY is not set');
  return key;
};

export const AudioService = {
  getTranscriptText: async (
    audio: Blob,
    options: TranscribeOptions = {},
  ): Promise<string> => {
    const { modelId, diarize, tagAudioEvents, languageCode } = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    const body = new FormData();
    body.append('file', audio, 'recording.webm');
    body.append('model_id', modelId);
    body.append('diarize', String(diarize));
    body.append('tag_audio_events', String(tagAudioEvents));
    body.append('language_code', languageCode);

    const res = await fetch(ELEVENLABS_ENDPOINTS.SPEECH_TO_TEXT, {
      method: 'POST',
      headers: { 'xi-api-key': getApiKey() },
      body,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail ?? 'Transcription failed');
    return data.text as string;
  },

  streamTextToSpeech: async (
    text: string,
    options: TextToSpeechOptions = {},
  ): Promise<ReadableStream> => {
    const { voiceId, modelId, outputFormat } = {
      ...DEFAULT_TTS_OPTIONS,
      ...options,
    };

    const res = await fetch(
      `${ELEVENLABS_ENDPOINTS.TEXT_TO_SPEECH}/${voiceId}?output_format=${outputFormat}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': getApiKey(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, model_id: modelId }),
      },
    );

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.detail ?? 'Text to speech failed');
    }

    return res.body as ReadableStream;
  },
};
