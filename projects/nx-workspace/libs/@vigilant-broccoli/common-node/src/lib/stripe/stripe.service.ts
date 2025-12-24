import Stripe from 'stripe';
import { getEnvironmentVariable } from '../utils';

export const StripeService = {
  getClient: () => {
    const apiKey = getEnvironmentVariable('STRIPE_API_KEY');
    return new Stripe(apiKey);
  },

  createCheckoutSession: async (params: {
    priceId: string;
    quantity: number;
    successUrl: string;
    cancelUrl: string;
  }) => {
    const stripe = StripeService.getClient();
    return await stripe.checkout.sessions.create({
      line_items: [
        {
          price: params.priceId,
          quantity: params.quantity,
        },
      ],
      mode: 'payment',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    });
  },
};
