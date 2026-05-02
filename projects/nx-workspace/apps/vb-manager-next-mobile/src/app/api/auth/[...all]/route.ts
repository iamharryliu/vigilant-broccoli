import { auth } from '../../../../../libs/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export async function GET(request: Request) {
  return toNextJsHandler(auth).GET(request);
}

export async function POST(request: Request) {
  return toNextJsHandler(auth).POST(request);
}
