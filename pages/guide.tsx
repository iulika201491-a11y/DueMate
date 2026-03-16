import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Guide() {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState(0);

  const sections = [
    {
      title: '1. Getting Started',
      content: [
        { subtitle: 'Sign Up', text: 'Visit duemate.eu and click "Start Free Trial". Sign up with your email. No credit card required. You get 7 days free to explore all features.' },
        { subtitle: 'Explore the Dashboard', text: 'After signing up, you\'ll see three tabs: Overview (summary of your invoices), Invoices (manage all invoices), and Clients (manage client information).' },
        { subtitle: 'Upgrade (Optional)', text: 'After 7 days, upgrade to Pro ($12/mo) or Plus ($29/mo) to keep using DueMate. Free trial includes basic tracking.' },
      ],
    },
    {
      title: '2. Setting Up Clients',
      content: [
        { subtitle: 'Add a Client', text: 'Go to Clients tab → click "+ New Client" → enter their name and email address → click "Add Client". That\'s it!' },
        { subtitle: 'Client Reliability Score', text: 'Plus plan automatically scores each client (Low/Medium/High/Critical risk) based on their payment history. Use this to identify which clients pay late.' },
        { subtitle: 'Edit or Delete Clients', text: 'Click "Edit" to update client details or "Delete" to remove them. Deleting a client does not delete their invoices.' },
      ],
    },
    {
      title: '3. Creating Invoices',
      content: [
        { subtitle: 'Create an Invoice', text: 'Go to Invoices tab → click "+ New Invoice" → select client, enter invoice number, amount, and due date → click "Create Invoice".' },
        { subtitle: 'Best Practices', text: 'Set clear due dates (Net 7, 15, or 30 days). Use sequential invoice numbers (001, 002, etc.). Include your payment terms to reduce disputes.' },
        { subtitle: 'Invoice Status', text: 'Invoices are "Pending" until paid. When the client pays, mark it as "Paid On Time" (before due date) or "Paid Late" (after due date).' },
      ],
    },
    {
      title: '4. Tracking Payments',
      content: [
        { subtitle: 'Overview Tab', text: 'See at a glance: Total Owed (all pending invoices), Overdue (past due date), and Paid Late (invoices paid after deadline).' },
        { subtitle: 'Identify Overdue Invoices', text: 'Overdue invoices appear highlighted in red on the Overview tab with "X days overdue" label. These need immediate attention.' },
        { subtitle: 'Cash Flow Forecast (Plus)', text: 'Plus plan shows projected income and when you\'ll receive payments based on client payment history. Use this for cash flow planning.' },
      ],
    },
    {
      title: '5. Sending Reminders',
      content: [
        { subtitle: 'Alert Me vs Remind Client', text: '"Alert Me" sends you an email saying the invoice is overdue. "Remind Client" sends your client an email asking them to pay.' },
        { subtitle: 'When to Send Reminders', text: 'Send "Alert Me" when an invoice becomes overdue. Send "Remind Client" 3-5 days after the due date, then again at 7 and 14 days.' },
        { subtitle: 'Automated Reminders (Pro/Plus)', text: 'Pro and Plus plans include automated reminder sequences. Set it once and reminders send automatically on your schedule.' },
        { subtitle: 'Email Templates', text: 'Reminders are professionally formatted and include invoice details, due date, and amount owed. Customize the tone in your dashboard settings.' },
      ],
    },
    {
      title: '6. Managing Late Payments',
      content: [
        { subtitle: 'Mark as Paid', text: 'When a client pays, click "Mark Paid" on the invoice. If it\'s past the due date, it\'s automatically marked "Paid Late".' },
        { subtitle: 'Late Fee Calculator', text: 'Use the calculator on Overview to show clients how much they owe with late fees (1.5% per month compounded). Share this to encourage faster payment.' },
        { subtitle: 'Download Payment Terms', text: 'Download professional payment term templates that include late fee clauses. Clients know upfront what happens if they don\'t pay on time.' },
      ],
    },
    {
      title: '7. Payment Terms & Contracts',
      content: [
        { subtitle: 'Available Templates', text: 'Net 7, Net 15, Net 30, Net 45 (standard terms), 50/50 Milestone (split payments), Deposit + Balance (upfront + final).' },
        { subtitle: 'How to Use', text: 'Go to Overview → "Payment Terms Templates" → click the term you want → download as .txt file → customize with your details → send to clients before work starts.' },
        { subtitle: 'Late Fees Included', text: 'All templates include 1.5% monthly late fee clause (18% annually). This protects you and sets client expectations.' },
      ],
    },
    {
      title: '8. Cash Flow Forecasting (Plus Plan)',
      content: [
        { subtitle: 'What It Shows', text: 'Projected income date based on each client\'s average payment speed. Example: "You\'ll receive $5,000 by March 25" based on historical data.' },
        { subtitle: 'Payment Schedule', text: 'See a breakdown of which clients will pay you and when. Plan your business around this projected cash flow.' },
        { subtitle: 'Accuracy Score', text: 'The forecast shows "High", "Medium", or "Low" accuracy based on how much payment history data you have. More invoices = higher accuracy.' },
      ],
    },
    {
      title: '9. Client Reliability Scoring (Plus Plan)',
      content: [
        { subtitle: 'What It Measures', text: 'Based on: payment rate (50%), on-time rate (30%), and overdue percentage (-20%). Gives you a 0-100 score for each client.' },
        { subtitle: 'Risk Levels', text: 'Low Risk (green): pays reliably on time. Medium Risk (yellow): pays but sometimes late. High Risk (red): frequent late payments. Critical (dark red): rarely pays on time.' },
        { subtitle: 'How to Use It', text: 'Identify high-risk clients and require deposits or shorter payment terms. Reward low-risk clients with longer terms.' },
      ],
    },
    {
      title: '10. Pro Tips & Best Practices',
      content: [
        { subtitle: 'Tip 1: Set Clear Terms', text: 'Always include payment terms in contracts. Clients who know the consequences (late fees) pay faster.' },
        { subtitle: 'Tip 2: Send Reminders Early', text: 'Send the first reminder 3 days after due date (not 30 days). Early action = faster payment.' },
        { subtitle: 'Tip 3: Use Deposits', text: 'For new or high-risk clients, require 50% upfront. Use the "Deposit + Balance" payment terms template.' },
        { subtitle: 'Tip 4: Track Patterns', text: 'Check client reliability scores monthly. Stop working with clients who consistently pay late.' },
        { subtitle: 'Tip 5: Automate Everything', text: 'Pro/Plus plans include automated reminders. Set them once and forget about manual follow-ups.' },
      ],
    },
  ];

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#1f2937' }}>
      {/* Navigation */}
      <nav style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, cursor: 'pointer' }} onClick={() => router.push('/')}>
          DueMate
        </h1>
        <button
          onClick={() => router.push('/auth')}
          style={{ background: '#1a1a1a', color: 'white', padding: '10px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
        >
          Sign In
        </button>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '12px' }}>How to Use DueMate</h2>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '40px' }}>
          A complete guide to tracking invoices, sending reminders, and getting paid faster.
        </p>

        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {sections.map((section, idx) => (
            <div key={idx} style={{ borderBottom: idx < sections.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
              {/* Section Header */}
              <button
                onClick={() => setExpandedSection(expandedSection === idx ? -1 : idx)}
                style={{
                  width: '100%',
                  padding: '20px',
                  background: expandedSection === idx ? '#f3f4f6' : 'white',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{section.title}</h3>
                <span style={{ fontSize: '20px', color: '#666' }}>{expandedSection === idx ? '−' : '+'}</span>
              </button>

              {/* Section Content */}
              {expandedSection === idx && (
                <div style={{ padding: '0 20px 20px 20px', background: 'white' }}>
                  {section.content.map((item, itemIdx) => (
                    <div key={itemIdx} style={{ marginBottom: itemIdx < section.content.length - 1 ? '24px' : 0 }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', margin: '0 0 8px 0', color: '#1f2937' }}>
                        {item.subtitle}
                      </h4>
                      <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, margin: 0 }}>{item.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: '40px', textAlign: 'center', padding: '32px', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Ready to get started?</h3>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>Try DueMate free for 7 days. No credit card required.</p>
          <button
            onClick={() => router.push('/auth')}
            style={{ background: '#1a1a1a', color: 'white', padding: '12px 28px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
          >
            Start Free Trial
          </button>
        </div>
      </div>
    </div>
  );
}
