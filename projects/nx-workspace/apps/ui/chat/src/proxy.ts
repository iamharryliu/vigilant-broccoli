import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getAccessEmail } from './lib/access-identity.server';

const FORBIDDEN_BODY = 'Forbidden';

// Rejects every request without a verified Cloudflare Access assertion,
// including direct hits on the *.vercel.app aliases that skip Cloudflare.
export async function proxy(request: NextRequest) {
  const email = await getAccessEmail(request.headers);
  if (!email) {
    return new NextResponse(FORBIDDEN_BODY, {
      status: HTTP_STATUS_CODES.FORBIDDEN,
    });
  }
  return NextResponse.next();
}

// Next internals (build assets, image optimizer, dev HMR) and the icons stay
// public: the bundle holds no secrets and metadata image routes must load
// without a session.
export const config = {
  matcher: ['/((?!_next/|favicon.ico|icon.svg|apple-icon.png).*)'],
};
