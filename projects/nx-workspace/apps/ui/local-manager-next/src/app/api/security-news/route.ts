import { getSecurityNews } from '@vigilant-broccoli/security-news';

export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json(await getSecurityNews());
}
