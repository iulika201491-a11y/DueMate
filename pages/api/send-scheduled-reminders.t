import { Resend } from 'resend';
import { supabase } from '../../lib/supabase';
import type { NextApiRequest, NextApiResponse } from 'next';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Simple auth check (use a secret header from your cron service)
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Find all pending reminders that should be sent today
    const now = new Date();
    const { data: reminders, error: fetchError } = await supabase
      .from('scheduled_reminders')
      .select('*, invoices(*), clients(*), auth.users(*)')
      .eq('status', 'pending')
      .lte('scheduled_for', now.toISOString());

    if (fetchError) throw fetchError;

    if (!reminders || reminders.length === 0) {
      return res.status(200).json({ message: 'No reminders to send' });
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const reminder of reminders) {
      try {
        const invoice = reminder.invoices;
        const client = reminder.clients;
        const user = reminder.users;

        const daysOverdue = Math.floor(
          (now.getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24)
        );

        const emailContent = {
          from: 'noreply@duemate.eu',
          to: client.email,
          subject: `Payment Reminder: Invoice #${invoice.invoice_number} is ${Math.max(daysOverdue, 0)} days overdue`,
          html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Payment Reminder</h2>
            <p>Hi ${client.name},</p>
            <p>This is a friendly reminder that invoice <strong>#${invoice.invoice_number}</strong> is now ${Math.max(daysOverdue, 0)} days overdue.</p>
            <p><strong>Invoice Amount:</strong> $${invoice.amount.toFixed(2)}</p>
            <p><strong>Due Date:</strong> ${invoice.due_date}</p>
            <p>Please arrange payment as soon as possible. If you have any questions, please reach out.</p>
            <p>Thank you!</p>
          </div>`,
        };

        const response = await resend.emails.send(emailContent);

        if (response.error) {
          // Mark as failed
          await supabase
            .from('scheduled_reminders')
            .update({ status: 'failed' })
            .eq('id', reminder.id);
          failedCount++;
        } else {
          // Mark as sent
          await supabase
            .from('scheduled_reminders')
            .update({ status: 'sent', sent_at: now.toISOString() })
            .eq('id', reminder.id);
          sentCount++;
        }
      } catch (error) {
        console.error('Error sending reminder:', error);
        failedCount++;
      }
    }

    return res.status(200).json({ sentCount, failedCount });
  } catch (error: any) {
    console.error('Send scheduled reminders error:', error);
    return res.status(500).json({ error: error.message });
  }
}
