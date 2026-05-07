import { NextRequest, NextResponse } from 'next/server';

const EMAIL_SERVICE_URL = 'https://vb-email-service.fly.dev/send-email';
const FROM = 'Harry Liu <contact@harryliu.dev>';

export const POST = async (req: NextRequest) => {
  const { service, emails } = await req.json();

  if (!service || !emails?.length) {
    return NextResponse.json(
      { error: 'service and emails are required' },
      { status: 400 },
    );
  }

  const apiKey = process.env.EMAIL_SERVICE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Email service not configured' },
      { status: 500 },
    );
  }

  const results = await Promise.allSettled(
    emails.map(async (to: string) => {
      const res = await fetch(EMAIL_SERVICE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
