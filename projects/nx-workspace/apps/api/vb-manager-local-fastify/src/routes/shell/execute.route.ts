import { open } from '@vigilant-broccoli/common-node';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export async function POST(request: Request) {
  const { type, target, args } = await request.json();
  await open(type, target, args);
  return new Response(null, { status: HTTP_STATUS_CODES.OK });
}
