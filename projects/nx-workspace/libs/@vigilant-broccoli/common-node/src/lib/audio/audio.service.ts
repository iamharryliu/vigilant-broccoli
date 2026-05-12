const ELEVENLABS_TRANSCRIBE_URL = 'https://api.elevenlabs.io/v1/speech-to-text';

const getApiKey = () => {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error('ELEVENLABS_API_KEY is not set');
  return key;
};

export const AudioService = {
  getTranscriptText: async (audio: Blob): Promise<string> => {
    const body = new FormData();
    body.append('file', audio, 'recording.webm');
    body.append('model_id', 'scribe_v1');
    body.append('tag_audio_events', 'false');

    const res = await fetch(ELEVENLABS_TRANSCRIBE_URL, {
      method: 'POST',
      headers: { 'xi-api-key': getApiKey() },
      body,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail ?? 'Transcription failed');
    return data.text as string;
  },
};
