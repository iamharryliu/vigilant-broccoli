import { NextRequest, NextResponse } from 'next/server';
import { AudioService } from '@vigilant-broccoli/common-node';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { text?: string; voiceId?: string };
  const text = body.text?.trim();

  if (!text)
    return NextResponse.json({ error: 'Text is required' }, { status: 400 });

  try {
    const audioStream = await AudioService.streamTextToSpeech(text, {
      voiceId: body.voiceId?.trim(),
    });
    return new Response(audioStream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to generate speech';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
