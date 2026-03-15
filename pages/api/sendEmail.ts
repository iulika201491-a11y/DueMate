import { Resend } from 'resend';
import type { NextApiRequest, NextApiResponse } from 'next';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { emailType, recipientEmail, clientName, invoiceNumber, daysOverdue, amount, freelancerName } = req.body;

  if (!emailType || !recipientEmail || !invoiceNumber) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    let emailContent;

    if (emailType === 'alert') {
      // Alert email to freelancer
      emailContent = {
        from: 'DueMate <noreply@duemate.eu>',
        to: recipientEmail,
        subject: `⚠️ Invoice #${invoiceNumber} is ${daysOverdue} days overdue!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #7c3aed;">Invoice Alert</h2>
            <p>Hi ${freelancerName || 'there'},</p>
            <p>Your invoice <strong>#${invoiceNumber}</strong> from <strong>${clientName}</strong> is <strong style="color: #ef4444;">${daysOverdue} days overdue</strong>.</p>
            <p><strong>Amount due:</strong> $${amount}</p>
            <p style="margin-top: 24px; padding: 16px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
              <strong>⏰ Action needed:</strong> Consider sending a payment reminder to your client.
            </p>
            <p style="margin-top: 24px;">
              <a href="https://duemate.eu/dashboard" style="display: inline-block; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">View Dashboard</a>
            </p>
            <p style="color: #666; font-size: 12px; margin-top: 40px;">This is an automated message from DueMate.</p>
          </div>
        `,
      };
    } else if (emailType === 'reminder') {
      // Reminder email to client
      emailContent = {
        from: 'DueMate <noreply@duemate.eu>',
        to: recipientEmail,
        subject: `Payment Reminder: Invoice #${invoiceNumber} is ${daysOverdue} days overdue`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #7c3aed;">Payment Reminder</h2>
            <p>Hi there,</p>
            <p>We're writing to remind you that invoice <strong>#${invoiceNumber}</strong> is now <strong style="color: #ef4444;">${daysOverdue} days overdue</strong>.</p>
            <div style="margin-top: 24px; padding: 20px; background: #f3f4f6; border-radius: 8px;">
              <p><strong>Invoice Details:</strong></p>
              <p style="margin: 8px 0;">Invoice #: ${invoiceNumber}</p>
              <p style="margin: 8px 0;">Amount Due: <strong style="font-size: 18px; color: #ef4444;">$${amount}</strong></p>
            </div>
            <p style="margin-top: 24px;">
              Please arrange payment as soon as possible to avoid further delays.
            </p>
            <p style="margin-top: 24px; color: #666; font-size: 14px;">
              If you have already sent payment, please disregard this notice and contact us with proof of payment.
            </p>
            <p style="color: #666; font-size: 12px; margin-top: 40px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        `,
      };
    }

    if (!emailContent) {
      return res.status(400).json({ error: 'Invalid email type' });
    }

    const response = await resend.emails.send(emailContent);

    return res.status(200).json({ success: true, messageId: response.id });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
