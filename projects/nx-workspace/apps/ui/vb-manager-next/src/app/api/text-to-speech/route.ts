import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

export const runtime = 'nodejs';

const DEFAULT_VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb';
const DEFAULT_MODEL_ID = 'eleven_multilingual_v2';

let elevenlabs: ElevenLabsClient | null = null;

const getElevenLabsClient = () => {
  if (!elevenlabs) {
    if (!process.env.ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }
    elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });
  }
  return elevenlabs;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      text?: string;
      voiceId?: string;
    };

    const text = body.text?.trim();
    const voiceId = body.voiceId?.trim() || DEFAULT_VOICE_ID;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const client = getElevenLabsClient();
    const audioStream = await client.textToSpeech.convert(voiceId, {
      text,
      modelId: DEFAULT_MODEL_ID,
      outputFormat: 'mp3_44100_128',
    });

    return new Response(audioStream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('ElevenLabs text-to-speech error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 },
    );
  }
}
