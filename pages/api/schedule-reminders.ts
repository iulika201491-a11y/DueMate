import { supabase } from '../../lib/supabase';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, invoiceId, clientId, dueDate } = req.body;

  if (!userId || !invoiceId || !clientId || !dueDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const dueDateObj = new Date(dueDate);

    // Schedule day 3 reminder
    const day3Date = new Date(dueDateObj);
    day3Date.setDate(day3Date.getDate() + 3);

    // Schedule day 7 reminder
    const day7Date = new Date(dueDateObj);
    day7Date.setDate(day7Date.getDate() + 7);

    const reminders = [
      {
        user_id: userId,
        invoice_id: invoiceId,
        client_id: clientId,
        reminder_type: 'day_3',
        scheduled_for: day3Date.toISOString(),
        status: 'pending',
      },
      {
        user_id: userId,
        invoice_id: invoiceId,
        client_id: clientId,
        reminder_type: 'day_7',
        scheduled_for: day7Date.toISOString(),
        status: 'pending',
      },
    ];

    const { data, error } = await supabase
      .from('scheduled_reminders')
      .insert(reminders)
      .select();

    if (error) throw error;

    return res.status(200).json({ success: true, reminders: data });
  } catch (error: any) {
    console.error('Schedule reminders error:', error);
    return res.status(500).json({ error: error.message });
  }
}
