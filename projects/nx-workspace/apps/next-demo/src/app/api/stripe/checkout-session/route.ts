import { StripeService } from '@vigilant-broccoli/common-node';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await StripeService.createCheckoutSession({
    priceId: 'price_1SEp4fGcwAVW94pPZYxh8Zdx',
    quantity: 1,
    successUrl: `${req.nextUrl.origin}/stripe/success`,
    cancelUrl: `${req.nextUrl.origin}/stripe/cancel`,
  });

  if (!session.url) {
    return new Response('Session URL not available', { status: 500 });
  }

  return Response.redirect(session.url, 303);
}
