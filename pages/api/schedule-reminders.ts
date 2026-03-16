import { supabase } from '../../lib/supabase';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, invoiceId, dueDate } = req.body;

  if (!userId || !invoiceId || !dueDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const dueDateObj = new Date(dueDate);
    const now = new Date();

    // Schedule 3 reminders: Day 3 overdue, Day 7 overdue, Day 14 overdue
    const reminders = [
      { days: 3, type: 'friendly' },
      { days: 7, type: 'firm' },
      { days: 14, type: 'final' }
    ];

    const scheduledReminders = [];

    for (const reminder of reminders) {
      const scheduledDate = new Date(dueDateObj);
      scheduledDate.setDate(scheduledDate.getDate() + reminder.days);

      // Only schedule if date is in the future
      if (scheduledDate > now) {
        const { data, error } = await supabase
          .from('reminder_sequences')
          .insert([{
            user_id: userId,
            invoice_id: invoiceId,
            sequence_number: reminders.indexOf(reminder) + 1,
            reminder_type: reminder.type,
            scheduled_for: scheduledDate.toISOString(),
            status: 'pending'
          }])
          .select();

        if (error) throw error;
        scheduledReminders.push(data);
      }
    }

    return res.status(200).json({ success: true, reminders: scheduledReminders });
  } catch (error: any) {
    console.error('Schedule error:', error);
    return res.status(500).json({ error: error.message || 'Failed to schedule reminders' });
  }
}
