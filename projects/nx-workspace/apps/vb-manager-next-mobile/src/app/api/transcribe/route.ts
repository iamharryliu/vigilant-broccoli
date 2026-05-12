import { NextRequest, NextResponse } from 'next/server';
import { AudioService } from '@vigilant-broccoli/common-node';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const audio = formData.get('audio') as Blob | null;
  if (!audio) return NextResponse.json({ error: 'No audio' }, { status: 400 });

  try {
    const text = await AudioService.getTranscriptText(audio);
    return NextResponse.json({ text });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Transcription failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
