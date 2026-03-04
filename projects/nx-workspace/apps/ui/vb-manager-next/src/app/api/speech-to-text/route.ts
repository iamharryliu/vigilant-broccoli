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
  const formData = await request.formData();
  const audioFile = formData.get('audio') as Blob;

  if (!audioFile) {
    return NextResponse.json(
      { error: 'No audio file provided' },
      { status: 400 },
    );
  }

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
      console.error('ElevenLabs transcription error:', error);
      return null;
    });

  if (!transcription) {
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 },
    );
  }

  return NextResponse.json({ transcript: transcription.text });
}
