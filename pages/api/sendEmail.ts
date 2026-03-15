import { Resend } from 'resend';
import type { NextApiRequest, NextApiResponse } from 'next';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { emailType, recipientEmail, clientName, invoiceNumber, daysOverdue, amount, freelancerName } = req.body;

  if (!emailType || !recipientEmail || !clientName || !invoiceNumber) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    let subject = '';
    let html = '';

    if (emailType === 'alert') {
      subject = `⚠️ Invoice #${invoiceNumber} is ${daysOverdue} days overdue!`;
      html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2>Invoice Alert</h2>
          <p>Hi ${freelancerName},</p>
          <p>Your invoice <strong>#${invoiceNumber}</strong> from <strong>${clientName}</strong> is <strong style="color:#ef4444;">${daysOverdue} days overdue</strong>.</p>
          <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
          <p><a href="https://duemate.eu/dashboard" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">View Dashboard</a></p>
          <p style="color:#666;font-size:12px;margin-top:40px;">This is an automated message from DueMate. <a href="https://duemate.eu">Learn more</a></p>
        </div>
      `;
    } else if (emailType === 'reminder') {
      subject = `Invoice #${invoiceNumber} – Payment Reminder`;
      html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2>Payment Reminder</h2>
          <p>Hi ${clientName},</p>
          <p>We're writing to remind you that invoice <strong>#${invoiceNumber}</strong> is now <strong style="color:#ef4444;">${daysOverdue} days overdue</strong>.</p>
          <p><strong>Invoice Amount:</strong> $${amount.toFixed(2)}</p>
          <p>Please arrange payment as soon as possible. If you have any questions, feel free to reach out.</p>
          <p style="color:#666;font-size:12px;margin-top:40px;">Thank you for your business!</p>
        </div>
      `;
    }

    const response = await resend.emails.send({
      from: 'DueMate <noreply@duemate.eu>',
      to: recipientEmail,
      subject: subject,
      html: html,
    });

    if (response.error) {
      return res.status(500).json({ success: false, error: response.error.message });
    }

    return res.status(200).json({ success: true, messageId: response.data?.id || 'sent' });
  } catch (error: any) {
    console.error('Email error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to send email' });
  }
}
