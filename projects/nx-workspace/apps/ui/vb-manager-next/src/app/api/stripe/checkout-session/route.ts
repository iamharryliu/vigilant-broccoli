import { StripeService } from '@vigilant-broccoli/money-movement';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await StripeService.createCheckoutSession({
    priceId: 'price_1SEp4fGcwAVW94pPZYxh8Zdx',
    quantity: 1,
    successUrl: `${req.nextUrl.origin}/stripe-demo/success`,
    cancelUrl: `${req.nextUrl.origin}/stripe-demo/cancel`,
  });

  if (!session.url) {
    return new Response('Session URL not available', {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }

  return Response.redirect(session.url, 303);
}
