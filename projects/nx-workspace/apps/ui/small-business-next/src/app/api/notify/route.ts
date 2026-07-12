import { NextRequest, NextResponse } from 'next/server';
import {
  HTTP_HEADERS,
  HTTP_METHOD,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';

const EMAIL_SERVICE_URL =
  'https://staging-vb-email-service.fly.dev/api/send-email';
const FROM = 'Harry Liu <contact@harryliu.dev>';

export const POST = async (req: NextRequest) => {
  const { service, emails } = await req.json();

  if (!service || !emails?.length) {
    return NextResponse.json(
      { error: 'service and emails are required' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const apiKey = process.env.SHARED_APP_TOKEN;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Email service not configured' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  const results = await Promise.allSettled(
    emails.map(async (to: string) => {
      const res = await fetch(EMAIL_SERVICE_URL, {
        method: HTTP_METHOD.POST,
        headers: {
          ...HTTP_HEADERS.CONTENT_TYPE.JSON,
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          from: FROM,
          to,
          subject: `[${service}] New update`,
          html: `<p>You have a new update from <strong>${service}</strong>.</p>`,
        }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
    }),
  );

  const failed = results
    .map((r, i) => (r.status === 'rejected' ? emails[i] : null))
    .filter(Boolean);

  return NextResponse.json({ sent: emails.length - failed.length, failed });
};
