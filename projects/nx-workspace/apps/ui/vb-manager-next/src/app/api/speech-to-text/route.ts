import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

let elevenlabs: ElevenLabsClient | null = null;

const getElevenLabsClient = () => {
  if (!elevenlabs) {
    elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });
  }
  return elevenlabs;
};

export async function POST(request: NextRequest) {
  console.log('[speech-to-text] POST request received');
  const startTime = Date.now();

  const formData = await request.formData();
  const audioFile = formData.get('audio') as Blob;

  if (!audioFile) {
    console.warn('[speech-to-text] No audio file provided');
    return NextResponse.json(
      { error: 'No audio file provided' },
      { status: 400 },
    );
  }

  const fileSizeKb = Math.round(audioFile.size / 1024);
  console.log(
    `[speech-to-text] Audio file received: ${fileSizeKb}KB, type: ${audioFile.type}`,
  );

  const client = getElevenLabsClient();
  const transcription = await client.speechToText
    .convert({
      file: audioFile,
      modelId: 'scribe_v2',
      tagAudioEvents: true,
      languageCode: 'eng',
      diarize: true,
    })
    .catch(error => {
      console.error('[speech-to-text] ElevenLabs transcription error:', error);
      return null;
    });

  if (!transcription) {
    const duration = Date.now() - startTime;
    console.error(`[speech-to-text] Transcription failed after ${duration}ms`);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 },
    );
  }

  const duration = Date.now() - startTime;
  const textLength = transcription.text.length;
  console.log(
    `[speech-to-text] Transcription complete: ${textLength} chars in ${duration}ms`,
  );

  return NextResponse.json({ transcript: transcription.text });
}
