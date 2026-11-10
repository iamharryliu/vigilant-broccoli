import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { AudioService } from '@vigilant-broccoli/common-node';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// The field name react-lib's useSpeechToText uploads the recording under.
const AUDIO_FIELD = 'audio';
const ERROR_NO_AUDIO = 'No audio file provided';
const ERROR_TRANSCRIPTION_FAILED = 'Transcription failed';

// Vercel Authentication gates every path, including this route, so only the
// signed-in owner reaches it.
export async function POST(request: NextRequest) {
  const audio = (await request.formData()).get(AUDIO_FIELD);
  if (!(audio instanceof Blob)) {
    return NextResponse.json(
      { error: ERROR_NO_AUDIO },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  try {
    const transcript = await AudioService.getTranscriptText(audio);
    return NextResponse.json({ transcript });
  } catch (err) {
    console.error(ERROR_TRANSCRIPTION_FAILED, err);
    return NextResponse.json(
      { error: ERROR_TRANSCRIPTION_FAILED },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
