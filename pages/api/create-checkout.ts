import Stripe from 'stripe';
import { supabase } from '../../lib/supabase';
import type { NextApiRequest, NextApiResponse } from 'next';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, email } = req.body;
  console.log('Checkout request:', { userId, email });

  if (!userId || !email) {
    return res.status(400).json({ error: 'Missing userId or email' });
  }

  try {
    console.log('Getting subscription...');
    const { data: subData, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    console.log('Subscription data:', subData, subError);

    let customerId = subData?.stripe_customer_id;

    if (!customerId) {
      console.log('Creating Stripe customer...');
      const customer = await stripe.customers.create({ email });
      customerId = customer.id;
      console.log('Created customer:', customerId);

      // Use upsert instead of insert to avoid duplicate key error
      const { error: upsertError } = await supabase
        .from('subscriptions')
        .upsert([{ user_id: userId, stripe_customer_id: customerId }], {
          onConflict: 'user_id',
        });
      
      console.log('Upsert error:', upsertError);
    }

    console.log('Creating checkout session with customer:', customerId);
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1TBJV5Rq7SrF2lsWo9eJKtfw',
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
    });

    console.log('Session created:', session.id);
    res.status(200).json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Checkout error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
}
