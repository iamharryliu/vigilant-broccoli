import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';

const ALLOWED_DOMAINS_ENV = 'ALLOWED_EMAIL_DOMAINS';
const ALLOWED_EMAILS_ENV = 'ALLOWED_EMAILS';
const SUPABASE_URL_ENV = 'NEXT_PUBLIC_SUPABASE_URL';
const SUPABASE_KEY_ENV = 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY';

const ERR_UNAUTHORIZED = 'Unauthorized';
const ERR_SUPABASE_NOT_CONFIGURED = 'Supabase not configured';

const parseList = (raw: string | undefined): string[] =>
  (raw ?? '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

const isAllowed = (email: string | undefined): boolean => {
  if (!email) return false;
  const lowered = email.toLowerCase();
  const allowedEmails = parseList(process.env[ALLOWED_EMAILS_ENV]);
  const allowedDomains = parseList(process.env[ALLOWED_DOMAINS_ENV]).map(d =>
    d.replace(/^@/, ''),
  );
  if (allowedEmails.length === 0 && allowedDomains.length === 0) return true;
  if (allowedEmails.includes(lowered)) return true;
  return allowedDomains.some(domain => lowered.endsWith(`@${domain}`));
};

const unauthorized = (): NextResponse =>
  NextResponse.json(
    { error: ERR_UNAUTHORIZED },
    { status: HTTP_STATUS_CODES.UNAUTHORIZED },
  );

export const proxy = async (req: NextRequest): Promise<NextResponse> => {
  const auth = req.headers.get(AUTHORIZATION_HEADER);
  if (!auth?.startsWith(BEARER_PREFIX)) return unauthorized();
  const token = auth.slice(BEARER_PREFIX.length);

  const supabaseUrl = process.env[SUPABASE_URL_ENV];
  const supabaseKey = process.env[SUPABASE_KEY_ENV];
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: ERR_SUPABASE_NOT_CONFIGURED },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return unauthorized();
  if (!isAllowed(data.user.email)) return unauthorized();

  return NextResponse.next();
};

export const config = {
  matcher: ['/api/:path*'],
};
