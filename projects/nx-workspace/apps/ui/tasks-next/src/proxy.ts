import { NextResponse } from 'next/server';
import { getFrameAncestors, getSupabaseUrl } from '../libs/runtime-config';

const CSP_HEADER = 'Content-Security-Policy';
const IS_DEV = process.env.NODE_ENV !== 'production';
// Lets a local manager frame a local tasks-next on any port.
const DEV_FRAME_ANCESTORS = ['http://localhost:*', 'http://127.0.0.1:*'];

// Built per request rather than in next.config.js headers(), which are fixed
// at build time, so the image takes its Supabase project and embedders from
// the environment. Sessions live in localStorage, so the policy blocks
// third-party scripts and any request off this origin and Supabase. Next's App
// Router inlines its hydration scripts, hence 'unsafe-inline' (a nonce would
// force dynamic rendering); dev adds eval and the HMR socket. Only the
// configured embedders may frame the app, which limits clickjacking on a
// signed-in frame.
const buildContentSecurityPolicy = (): string => {
  const supabaseUrl = getSupabaseUrl();
  const policy = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      ...(IS_DEV ? ["'unsafe-eval'"] : []),
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:'],
    'font-src': ["'self'", 'data:'],
    'connect-src': [
      "'self'",
      supabaseUrl,
      supabaseUrl.replace('https://', 'wss://'),
      ...(IS_DEV ? ['ws:'] : []),
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': [
      "'self'",
      ...getFrameAncestors(),
      ...(IS_DEV ? DEV_FRAME_ANCESTORS : []),
    ],
  };
  return Object.entries(policy)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
};

export const proxy = () => {
  const response = NextResponse.next();
  response.headers.set(CSP_HEADER, buildContentSecurityPolicy());
  return response;
};

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
