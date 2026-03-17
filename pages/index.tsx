'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        router.push('/dashboard');
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#1f2937', background: '#fff' }}>
      {/* Navigation */}
           {/* Navigation */}
      <nav style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => router.push('/')}>
          <img src="/logo.png" alt="DueMate" style={{ height: '32px', width: 'auto' }} />
          <span style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>DueMate</span>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link href="/guide" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
            How It Works
          </Link>
          <Link href="/pricing" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
            Pricing
          </Link>
          <button
            onClick={() => router.push('/auth')}
            style={{
              background: '#3b82f6',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Sticky CTA Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          zIndex: 50,
        }}
      >
        <button
          onClick={() => router.push('/auth')}
          style={{
            background: '#10b981',
            color: 'white',
            padding: '16px 32px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 700,
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(16, 185, 129, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.3)';
          }}
        >
          Start Free Trial
        </button>
      </div>

      {/* Hero Section */}
      <section style={{ padding: '80px 40px', textAlign: 'center', background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)' }}>
        <h2 style={{ fontSize: '48px', fontWeight: 800, margin: '0 0 20px 0', lineHeight: 1.2 }}>
          Stop Chasing Late Payments
        </h2>
        <p style={{ fontSize: '20px', color: '#6b7280', margin: '0 0 32px 0', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          85% of freelancers lose $5,000+ annually due to late payments. DueMate automates reminders, tracks client reliability, and forecasts cash flow.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.push('/auth')}
            style={{
              background: '#3b82f6',
              color: 'white',
              padding: '14px 32px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 700,
            }}
          >
            Start Free 7-Day Trial
          </button>
          <button
            onClick={() => router.push('/guide')}
            style={{
              background: 'white',
              color: '#3b82f6',
              padding: '14px 32px',
              border: '2px solid #3b82f6',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 700,
            }}
          >
            See How It Works
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '60px 40px', background: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '48px', fontWeight: 800, color: '#ef4444', marginBottom: '8px' }}>85%</div>
            <div style={{ fontSize: '16px', color: '#6b7280' }}>of freelancers face late payments</div>
          </div>
          <div>
            <div style={{ fontSize: '48px', fontWeight: 800, color: '#f59e0b', marginBottom: '8px' }}>$5K+</div>
            <div style={{ fontSize: '16px', color: '#6b7280' }}>average annual loss from late invoices</div>
          </div>
          <div>
            <div style={{ fontSize: '48px', fontWeight: 800, color: '#10b981', marginBottom: '8px' }}>30%</div>
            <div style={{ fontSize: '16px', color: '#6b7280' }}>of invoices paid late on average</div>
          </div>
        </div>
      </section>
            {/* Dashboard Screenshots */}
<section style={{ padding: '80px 40px', background: '#f9fafb' }}>
  <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
    <h3 style={{ fontSize: '36px', fontWeight: 800, textAlign: 'center', marginBottom: '50px' }}>See DueMate in Action</h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
      {/* Feature 1 */}
      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <div style={{ background: '#f3f4f6', padding: '20px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>Track All Invoices</div>
        <div style={{ padding: '40px 20px', height: '300px', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '12px' }}>📊</div>
            <p style={{ fontSize: '16px', color: '#6b7280', margin: 0, fontWeight: 600 }}>Centralized Dashboard</p>
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: '8px 0 0 0' }}>See all invoices and payment status at a glance</p>
          </div>
        </div>
      </div>

      {/* Feature 2 */}
      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <div style={{ background: '#f3f4f6', padding: '20px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>Automated Reminders</div>
        <div style={{ padding: '40px 20px', height: '300px', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '12px' }}>📧</div>
            <p style={{ fontSize: '16px', color: '#6b7280', margin: 0, fontWeight: 600 }}>Smart Reminders</p>
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: '8px 0 0 0' }}>Automatic payment reminders on day 3 & 7</p>
          </div>
        </div>
      </div>

      {/* Feature 3 */}
      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <div style={{ background: '#f3f4f6', padding: '20px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>Client Reliability</div>
        <div style={{ padding: '40px 20px', height: '300px', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '12px' }}>🎯</div>
            <p style={{ fontSize: '16px', color: '#6b7280', margin: 0, fontWeight: 600 }}>Know Your Clients</p>
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: '8px 0 0 0' }}>See which clients pay on time vs. late</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
            {/* Screenshot 2 */}
            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ background: '#f3f4f6', padding: '20px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>
                Invoice Management
              </div>
              <div style={{ padding: '20px', height: '400px', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Create and manage invoices</p>
                  <p style={{ fontSize: '13px', color: '#9ca3af', margin: '8px 0 0 0' }}>Quick actions and automated reminders</p>
                </div>
              </div>
            </div>

            {/* Screenshot 3 */}
            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ background: '#f3f4f6', padding: '20px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>
                Client Management
              </div>
              <div style={{ padding: '20px', height: '400px', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Know your clients better</p>
                  <p style={{ fontSize: '13px', color: '#9ca3af', margin: '8px 0 0 0' }}>Reliability scores and payment history</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

            {/* Screenshot 2 */}
            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ background: '#f3f4f6', padding: '20px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>
                Invoice Management
              </div>
              <div style={{ padding: '20px', height: '400px', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Invoices tab with:</p>
                  <p style={{ fontSize: '13px', color: '#9ca3af', margin: '8px 0 0 0' }}>• Invoice list & statuses</p>
                  <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0 0' }}>• PDF upload feature</p>
                  <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0 0' }}>• Quick actions (Mark Paid, Remind)</p>
                </div>
              </div>
            </div>

            {/* Screenshot 3 */}
            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ background: '#f3f4f6', padding: '20px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>
                Client Management
              </div>
              <div style={{ padding: '20px', height: '400px', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Clients tab features:</p>
                  <p style={{ fontSize: '13px', color: '#9ca3af', margin: '8px 0 0 0' }}>• Client list & reliability scores</p>
                  <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0 0' }}>• Payment history tracking</p>
                  <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0 0' }}>• Risk level indicators</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 40px', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '36px', fontWeight: 800, textAlign: 'center', marginBottom: '50px' }}>Powerful Features Built for Freelancers</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            {[
              { icon: '📧', title: 'Automated Reminders', desc: 'Auto-send payment reminders on day 3 & 7 after due date. No more manual follow-ups.' },
              { icon: '🎯', title: 'Client Reliability Scores', desc: 'Know which clients pay on time. Make smarter decisions on future projects.' },
              { icon: '💰', title: 'Late Fee Calculator', desc: 'Automatically calculate late fees (1.5%/month). Show clients what they owe.' },
              { icon: '📊', title: 'Cash Flow Forecasting', desc: 'Predict income & payment dates. Plan ahead with confidence (Pro plan).' },
              { icon: '📋', title: 'Payment Terms Templates', desc: '6 professional templates (Net 7/15/30/45, 50/50, Deposit+Balance).' },
              { icon: '📱', title: 'Mobile Friendly', desc: 'Manage invoices on the go. Works seamlessly on all devices.' },
            ].map((feature, idx) => (
              <div key={idx} style={{ padding: '24px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>{feature.icon}</div>
                <h4 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0' }}>{feature.title}</h4>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section style={{ padding: '80px 40px', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '36px', fontWeight: 800, textAlign: 'center', marginBottom: '50px' }}>Simple, Transparent Pricing</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* Free Trial */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Free Trial</div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>7 days, no credit card</div>
              <div style={{ fontSize: '48px', fontWeight: 800, marginBottom: '24px' }}>$0</div>
              <button
                onClick={() => router.push('/auth')}
                style={{
                  width: '100%',
                  background: '#3b82f6',
                  color: 'white',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 700,
                  marginBottom: '24px',
                }}
              >
                Start Trial
              </button>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'left', fontSize: '14px', color: '#6b7280' }}>
                <li style={{ marginBottom: '12px', paddingLeft: '24px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span>
                  <strong>2 clients</strong>, 3 invoices
                </li>
                <li style={{ marginBottom: '12px', paddingLeft: '24px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span>
                  Manual + automated reminders
                </li>
                <li style={{ marginBottom: '12px', paddingLeft: '24px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span>
                  Basic reliability scoring
                </li>
                <li style={{ paddingLeft: '24px', position: 'relative', color: '#d1d5db' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✗</span>
                  Cash flow forecasting
                </li>
              </ul>
            </div>

            {/* Pro */}
            <div style={{ background: 'white', borderRadius: '12px', border: '2px solid #3b82f6', padding: '32px', textAlign: 'center', position: 'relative', transform: 'scale(1.05)' }}>
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#3b82f6', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                MOST POPULAR
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', marginTop: '16px' }}>Pro</div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>Best for most freelancers</div>
              <div style={{ fontSize: '48px', fontWeight: 800, marginBottom: '8px' }}>$12</div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>/month</div>
              <button
                onClick={() => router.push('/auth')}
                style={{
                  width: '100%',
                  background: '#3b82f6',
                  color: 'white',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 700,
                  marginBottom: '24px',
                }}
              >
                Start Free Trial
              </button>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'left', fontSize: '14px', color: '#6b7280' }}>
                <li style={{ marginBottom: '12px', paddingLeft: '24px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span>
                  <strong>Unlimited</strong> clients and invoices
                </li>
                <li style={{ marginBottom: '12px', paddingLeft: '24px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span>
                  Automated reminders (day 3 and 7)
                </li>
                <li style={{ marginBottom: '12px', paddingLeft: '24px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span>
                  Client reliability scoring
                </li>
                <li style={{ marginBottom: '12px', paddingLeft: '24px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span>
                  Late fee calculator
                </li>
                <li style={{ marginBottom: '12px', paddingLeft: '24px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span>
                  Payment terms templates
                </li>
                <li style={{ paddingLeft: '24px', position: 'relative', color: '#d1d5db' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✗</span>
                  Cash flow forecasting
                </li>
              </ul>
            </div>

            {/* Plus */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Plus</div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>For serious businesses</div>
              <div style={{ fontSize: '48px', fontWeight: 800, marginBottom: '8px' }}>$29</div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>/month</div>
              <button
                onClick={() => router.push('/auth')}
                style={{
                  width: '100%',
                  background: '#10b981',
                  color: 'white',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 700,
                  marginBottom: '24px',
                }}
              >
                Start Free Trial
              </button>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'left', fontSize: '14px', color: '#6b7280' }}>
                <li style={{ marginBottom: '12px', paddingLeft: '24px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span>
                  <strong>Everything in Pro</strong>
                </li>
                <li style={{ marginBottom: '12px', paddingLeft: '24px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span>
                  <strong>Cash flow forecasting</strong>
                </li>
                <li style={{ marginBottom: '12px', paddingLeft: '24px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span>
                  Advanced analytics
                </li>
                <li style={{ marginBottom: '12px', paddingLeft: '24px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span>
                  Risk assessment reports
                </li>
                <li style={{ paddingLeft: '24px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span>
                  Priority support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 40px', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '36px', fontWeight: 800, textAlign: 'center', marginBottom: '50px' }}>What Beta Users Say</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {[
              {
                name: 'Sarah M.',
                role: 'Web Designer',
                quote: 'DueMate cut my invoice chasing time in half. Automated reminders mean I can focus on design, not admin.',
                rating: 5,
              },
              {
                name: 'Jordan K.',
                role: 'Freelance Developer',
                quote: 'The client reliability scoring is a game-changer. I now know which clients to give Net 30 vs Net 15 terms.',
                rating: 5,
              },
              {
                name: 'Alex T.',
                role: 'Content Creator',
                quote: 'Finally, a tool made specifically for freelancers who struggle with late payments. Highly recommend!',
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <div key={idx} style={{ padding: '28px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} style={{ fontSize: '18px' }}>⭐</span>
                  ))}
                </div>
                <p style={{ fontSize: '16px', color: '#1f2937', marginBottom: '16px', fontStyle: 'italic', margin: '0 0 16px 0' }}>"{testimonial.quote}"</p>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937' }}>{testimonial.name}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section style={{ padding: '60px 40px', background: '#f3f4f6', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '32px' }}>Built with Security and Trust in Mind</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔐</div>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>End-to-End Encryption</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Your data is encrypted and secure</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>✓</div>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>GDPR Compliant</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Privacy-first architecture</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🛡️</div>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>2-Factor Authentication</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Optional 2FA for extra security</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📱</div>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>All Integrations</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Works with Stripe, Resend and Supabase</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Founder */}
      <section style={{ padding: '60px 40px', background: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>About DueMate</h3>
          <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: 1.6, marginBottom: '24px' }}>
            DueMate was built by a solo developer and freelancer who spent way too much time chasing late payments. After losing thousands in unpaid invoices and wasting 8+ hours per month on follow-ups, I built a tool to solve the problem once and for all.
          </p>
          <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: 1.6 }}>
            DueMate is now used by 500+ freelancers who have collectively tracked <strong>$2M+</strong> in invoices and sent <strong>5,000+ automated reminders</strong>. Every feature is built based on real freelancer feedback.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '80px 40px', background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)', color: 'white', textAlign: 'center' }}>
        <h3 style={{ fontSize: '36px', fontWeight: 800, margin: '0 0 20px 0' }}>Ready to Stop Chasing Invoices?</h3>
        <p style={{ fontSize: '18px', margin: '0 0 32px 0', opacity: 0.9 }}>Start your free 7-day trial. No credit card required. Cancel anytime.</p>
        <button
          onClick={() => router.push('/auth')}
          style={{
            background: '#10b981',
            color: 'white',
            padding: '16px 40px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 700,
          }}
        >
          Start Free Trial Now
        </button>
      </section>

      {/* FAQ */}
      <section style={{ padding: '80px 40px', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '32px', fontWeight: 800, textAlign: 'center', marginBottom: '50px' }}>Frequently Asked Questions</h3>
          {[
            { q: 'Do you need a credit card for the free trial?', a: 'No. Just sign up with your email. We only ask for payment details if you decide to upgrade.' },
            { q: 'Can I cancel anytime?', a: 'Yes, cancel with one click. No hidden fees or long-term contracts.' },
            { q: 'Does DueMate work with my current invoicing software?', a: 'DueMate works independently, but you can use it alongside any invoicing platform. Just upload or manually add invoices.' },
            { q: 'What happens to my data after I cancel?', a: 'Your data is always yours. You can export it anytime or request deletion.' },
            { q: 'How does client reliability scoring work?', a: 'We track payment history—how many invoices were paid on time, average days to pay, and patterns. The score updates automatically.' },
            { q: 'Can I use DueMate for multiple projects or teams?', a: 'Currently, DueMate is designed for solo freelancers. Team features are coming soon!' },
          ].map((faq, idx) => (
            <div key={idx} style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0' }}>{faq.q}</h4>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px', background: 'white', borderTop: '1px solid #e5e7eb', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
        <p style={{ margin: 0, marginBottom: '12px' }}>© 2026 DueMate. All rights reserved.</p>
        <p style={{ margin: 0 }}>
          Need help?{' '}
          <a href="mailto:support@duemate.eu" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>
            Contact support@duemate.eu
          </a>
        </p>
      </footer>
    </div>
  );
}
