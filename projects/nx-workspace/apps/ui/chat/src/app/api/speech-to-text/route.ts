import { NextRequest, NextResponse } from 'next/server';
import {
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  HTTP_STATUS_CODES,
  VB_EXPRESS_ENDPOINT,
} from '@vigilant-broccoli/common-js';
import { vbExpressAuthHeaders, vbExpressUrl } from '../../../lib/vb-express';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const APPLICATION_JSON = 'application/json';
const ERROR_TRANSCRIPTION_FAILED = 'Transcription failed';

// Vercel Authentication gates every path, including this route, so only the
// signed-in owner reaches it.
export async function POST(request: NextRequest) {
  try {
    const res = await fetch(vbExpressUrl(VB_EXPRESS_ENDPOINT.SPEECH_TO_TEXT), {
      method: HTTP_METHOD.POST,
      headers: {
        ...vbExpressAuthHeaders(),
        // Keeps the multipart boundary react-lib's recorder generated.
        [CONTENT_TYPE_HEADER]: request.headers.get(CONTENT_TYPE_HEADER) ?? '',
      },
      body: request.body,
      // @ts-expect-error Node fetch supports duplex
      duplex: 'half',
    });
    if (!res.headers.get(CONTENT_TYPE_HEADER)?.includes(APPLICATION_JSON)) {
      throw new Error(`vb-express ${res.status}`);
    }
    return NextResponse.json(await res.json(), { status: res.status });
  } catch (err) {
    console.error(ERROR_TRANSCRIPTION_FAILED, err);
    return NextResponse.json(
      { error: ERROR_TRANSCRIPTION_FAILED },
      { status: HTTP_STATUS_CODES.BAD_GATEWAY },
    );
  }
}
