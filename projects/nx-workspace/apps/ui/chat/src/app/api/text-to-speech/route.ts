import { NextRequest, NextResponse } from 'next/server';
import {
  CONTENT_TYPE_HEADER,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';
import { AudioService } from '@vigilant-broccoli/common-node';
import { TEXT_TO_SPEECH_MAX_CHARS } from '../../app.const';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ERROR_TEXT_REQUIRED = 'Text is required';
const ERROR_TEXT_TOO_LONG = `Text exceeds ${TEXT_TO_SPEECH_MAX_CHARS} characters`;
const ERROR_TTS_FAILED = 'Failed to generate speech';
const AUDIO_CONTENT_TYPE = 'audio/mpeg';
const CACHE_CONTROL_HEADER = 'Cache-Control';
const NO_STORE = 'no-store';

// Vercel Authentication gates every path, including this route, so only the
// signed-in owner reaches it.
export async function POST(request: NextRequest) {
  const { text, voiceId, languageCode } = (await request.json()) as {
    text?: string;
    voiceId?: string;
    languageCode?: string;
  };
  const trimmedText = text?.trim();

  if (!trimmedText) {
    return NextResponse.json(
      { error: ERROR_TEXT_REQUIRED },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  // ElevenLabs bills per character, so a long reply is refused, not spoken.
  if (trimmedText.length > TEXT_TO_SPEECH_MAX_CHARS) {
    return NextResponse.json(
      { error: ERROR_TEXT_TOO_LONG },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  try {
    const audioStream = await AudioService.streamTextToSpeech(trimmedText, {
      ...(voiceId?.trim() && { voiceId: voiceId.trim() }),
      ...(languageCode?.trim() && { languageCode: languageCode.trim() }),
    });
    return new Response(audioStream, {
      headers: {
        [CONTENT_TYPE_HEADER]: AUDIO_CONTENT_TYPE,
        [CACHE_CONTROL_HEADER]: NO_STORE,
      },
    });
  } catch (err) {
    console.error(ERROR_TTS_FAILED, err);
    return NextResponse.json(
      { error: ERROR_TTS_FAILED },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
