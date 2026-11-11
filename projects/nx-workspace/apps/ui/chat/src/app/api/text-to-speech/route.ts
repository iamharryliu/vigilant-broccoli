import { NextRequest, NextResponse } from 'next/server';
import {
  CONTENT_TYPE_HEADER,
  HTTP_HEADERS,
  HTTP_METHOD,
  HTTP_STATUS_CODES,
  VB_EXPRESS_ENDPOINT,
} from '@vigilant-broccoli/common-js';
import { vbExpressAuthHeaders, vbExpressUrl } from '../../../lib/vb-express';
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
  const body = (await request.json()) as {
    text?: string;
    voiceId?: string;
    languageCode?: string;
  };
  const text = body.text?.trim();

  if (!text) {
    return NextResponse.json(
      { error: ERROR_TEXT_REQUIRED },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  // ElevenLabs bills per character, so a long reply is refused, not spoken.
  if (text.length > TEXT_TO_SPEECH_MAX_CHARS) {
    return NextResponse.json(
      { error: ERROR_TEXT_TOO_LONG },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  try {
    const res = await fetch(vbExpressUrl(VB_EXPRESS_ENDPOINT.TEXT_TO_SPEECH), {
      method: HTTP_METHOD.POST,
      headers: {
        ...HTTP_HEADERS.CONTENT_TYPE.JSON,
        ...vbExpressAuthHeaders(),
      },
      body: JSON.stringify({ ...body, text }),
    });
    if (!res.ok || !res.body) throw new Error(`vb-express ${res.status}`);
    return new Response(res.body, {
      headers: {
        [CONTENT_TYPE_HEADER]: AUDIO_CONTENT_TYPE,
        [CACHE_CONTROL_HEADER]: NO_STORE,
      },
    });
  } catch (err) {
    console.error(ERROR_TTS_FAILED, err);
    return NextResponse.json(
      { error: ERROR_TTS_FAILED },
      { status: HTTP_STATUS_CODES.BAD_GATEWAY },
    );
  }
}
