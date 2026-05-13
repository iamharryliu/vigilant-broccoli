import { NextRequest, NextResponse } from 'next/server';
import { AudioService } from '@vigilant-broccoli/common-node';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const audioFile = formData.get('audio') as Blob | null;

  if (!audioFile)
    return NextResponse.json(
      { error: 'No audio file provided' },
      { status: 400 },
    );

  try {
    const transcript = await AudioService.getTranscriptText(audioFile);
    return NextResponse.json({ transcript });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to transcribe audio';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
