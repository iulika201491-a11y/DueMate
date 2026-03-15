import { supabase } from '../../lib/supabase';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    let { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    // If no subscription record, create trial
    if (!sub) {
      const now = new Date();
      const trialEndsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const { data: newSub } = await supabase
        .from('subscriptions')
        .insert([
          {
            user_id: userId,
            status: 'trial',
            trial_ends_at: trialEndsAt.toISOString(),
          },
        ])
        .select()
        .single();

      sub = newSub;
    }

    // Check if trial expired
    const trialEndTime = new Date(sub.trial_ends_at).getTime();
    const nowTime = new Date().getTime();
    const isTrialExpired = trialEndTime < nowTime;

    if (isTrialExpired && sub.status === 'trial') {
      await supabase
        .from('subscriptions')
        .update({ status: 'trial_expired' })
        .eq('user_id', userId);
      
      sub.status = 'trial_expired';
    }

    const canUseFeatures = sub.status === 'trial' || sub.status === 'active';
    const invoiceLimit = sub.status === 'active' ? Infinity : 5;
    const clientLimit = sub.status === 'active' ? Infinity : 3;
    
    const daysLeftInTrial = sub.status === 'trial'
      ? Math.ceil((trialEndTime - nowTime) / (1000 * 60 * 60 * 24))
      : 0;

    return res.status(200).json({
      status: sub.status,
      canUseFeatures,
      invoiceLimit,
      clientLimit,
      daysLeftInTrial,
      trialEndsAt: sub.trial_ends_at,
    });
  } catch (error) {
    console.error('Check subscription error:', error);
    return res.status(500).json({ error: 'Failed to check subscription' });
  }
}
