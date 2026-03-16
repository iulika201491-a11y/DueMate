import { Resend } from 'resend';
import type { NextApiRequest, NextApiResponse } from 'next';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { emailType, recipientEmail, clientName, invoiceNumber, daysOverdue, amount } = req.body;

  if (!emailType || !recipientEmail || !clientName || !invoiceNumber) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    let subject = '';
    let html = '';

    if (emailType === 'alert') {
      subject = `⚠️ Invoice #${invoiceNumber} is ${daysOverdue} days overdue!`;
      html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Invoice Alert</h2>
        <p>Your invoice <strong>#${invoiceNumber}</strong> from <strong>${clientName}</strong> is <strong style="color: #ef4444;">${daysOverdue} days overdue</strong>.</p>
        <p><strong>Amount:</strong> $${amount}</p>
        <p>Log in to your dashboard to send a reminder or mark as paid.</p>
      </div>`;
    } else if (emailType === 'reminder') {
      subject = `Invoice #${invoiceNumber} – Payment Reminder`;
      html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment Reminder</h2>
        <p>Hi ${clientName},</p>
        <p>We're writing to remind you that invoice <strong>#${invoiceNumber}</strong> is now overdue.</p>
        <p><strong>Amount:</strong> $${amount}</p>
        <p>Please arrange payment as soon as possible.</p>
      </div>`;
    }

    const response = await resend.emails.send({
      from: 'noreply@duemate.eu',
      to: recipientEmail,
      subject,
      html,
    });

    if (response.error) {
      console.error('Resend error:', response.error);
      return res.status(500).json({ error: response.error.message });
    }

    return res.status(200).json({ success: true, messageId: response.data?.id });
  } catch (error: any) {
    console.error('Email error:', error);
    return res.status(500).json({ error: error.message });
  }
}
