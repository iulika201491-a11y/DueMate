import type { NextApiRequest, NextApiResponse } from 'next';

interface PaymentTerm {
  id: string;
  name: string;
  description: string;
  content: string;
  icon: string;
}

const paymentTerms: PaymentTerm[] = [
  {
    id: 'net-7',
    name: 'Net 7',
    description: 'Payment due 7 days after invoice',
    icon: '⚡',
    content: `PAYMENT TERMS

Payment is due within 7 days of invoice date.

Late Payment:
- Any invoices not paid within 7 days will incur a late fee of 1.5% per month (18% per year).
- Late fees compound monthly until payment is received.

Example: A $1,000 invoice due on Day 0
- Day 8: Late fee of $15 applied (1.5%)
- Day 38: Additional $15 late fee (1.5% per month)

Payment Method:
Payment should be made via [Bank Transfer / PayPal / Credit Card].

Disputes:
Any payment disputes must be raised within 7 days of invoice date. After 7 days, the invoice is considered accepted.

By accepting this invoice, you agree to these payment terms.`
  },
  {
    id: 'net-15',
    name: 'Net 15',
    description: 'Payment due 15 days after invoice',
    icon: '📅',
    content: `PAYMENT TERMS

Payment is due within 15 days of invoice date.

Late Payment:
- Any invoices not paid within 15 days will incur a late fee of 1.5% per month (18% per year).
- Late fees compound monthly until payment is received.

Example: A $1,000 invoice due on Day 0
- Day 16: Late fee of $15 applied (1.5%)
- Day 46: Additional $15 late fee (1.5% per month)

Payment Method:
Payment should be made via [Bank Transfer / PayPal / Credit Card].

Disputes:
Any payment disputes must be raised within 15 days of invoice date. After 15 days, the invoice is considered accepted.

By accepting this invoice, you agree to these payment terms.`
  },
  {
    id: 'net-30',
    name: 'Net 30',
    description: 'Payment due 30 days after invoice',
    icon: '📆',
    content: `PAYMENT TERMS

Payment is due within 30 days of invoice date.

Late Payment:
- Any invoices not paid within 30 days will incur a late fee of 1.5% per month (18% per year).
- Late fees compound monthly until payment is received.

Example: A $1,000 invoice due on Day 0
- Day 31: Late fee of $15 applied (1.5%)
- Day 61: Additional $15 late fee (1.5% per month)

Payment Method:
Payment should be made via [Bank Transfer / PayPal / Credit Card].

Disputes:
Any payment disputes must be raised within 30 days of invoice date. After 30 days, the invoice is considered accepted.

By accepting this invoice, you agree to these payment terms.`
  },
  {
    id: 'net-45',
    name: 'Net 45',
    description: 'Payment due 45 days after invoice',
    icon: '⏰',
    content: `PAYMENT TERMS

Payment is due within 45 days of invoice date.

Late Payment:
- Any invoices not paid within 45 days will incur a late fee of 1.5% per month (18% per year).
- Late fees compound monthly until payment is received.

Example: A $1,000 invoice due on Day 0
- Day 46: Late fee of $15 applied (1.5%)
- Day 76: Additional $15 late fee (1.5% per month)

Payment Method:
Payment should be made via [Bank Transfer / PayPal / Credit Card].

Disputes:
Any payment disputes must be raised within 45 days of invoice date. After 45 days, the invoice is considered accepted.

By accepting this invoice, you agree to these payment terms.`
  },
  {
    id: '50-50-milestone',
    name: '50/50 Milestone',
    description: '50% upfront, 50% on completion',
    icon: '🎯',
    content: `PAYMENT TERMS - MILESTONE BASED

This project is split into two payment milestones.

Milestone 1 - Initial Payment: 50% due upfront before work begins
Milestone 2 - Final Payment: 50% due upon completion and approval

Milestone 1 Details:
- Amount: 50% of total project fee
- Due: Before work commences
- Purpose: Secures availability and covers initial resources

Milestone 2 Details:
- Amount: 50% of total project fee
- Due: Within 7 days of project completion and client approval
- Late Fee: 1.5% per month (18% per year) for any payments past due

Example: $2,000 project
- Milestone 1: $1,000 due upfront
- Milestone 2: $1,000 due within 7 days of completion

Payment Method:
Payment should be made via [Bank Transfer / PayPal / Credit Card].

Project Pause:
If Milestone 1 is not received, work will not commence. If Milestone 2 is not received within 7 days of completion, additional deliverables will be paused.

By accepting this contract, you agree to these payment terms.`
  },
  {
    id: 'deposit-balance',
    name: 'Deposit + Balance',
    description: 'Deposit to secure, balance on delivery',
    icon: '💰',
    content: `PAYMENT TERMS

This project requires a deposit to secure the start date and completion timeline.

Deposit Details:
- Amount: 30% of total project fee
- Due: Within 2 days of contract acceptance
- Purpose: Confirms commitment and covers initial setup/resources
- Non-refundable after work commences

Balance Details:
- Amount: 70% of total project fee
- Due: Within 7 days of final delivery
- Late Fee: 1.5% per month (18% per year) for any payments past due

Example: $3,000 project
- Deposit: $900 due immediately
- Balance: $2,100 due within 7 days of completion

Payment Method:
Payment should be made via [Bank Transfer / PayPal / Credit Card].

Late Deliverables:
If deposit is not received within 2 days, the project start date will be pushed back 1 week.

Project Hold:
If balance is not received within 7 days of delivery, the files/access will be held until payment clears.

By accepting this contract, you agree to these payment terms.`
  }
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json({ terms: paymentTerms });
}
