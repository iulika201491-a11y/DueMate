import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleStartFreeTrial = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/auth');
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1f2937' }}>
      {/* Navigation */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
        <img src="/logo.png" alt="DueMate" style={{ height: '120px', width: 'auto', cursor: 'pointer' }} onClick={() => router.push('/')} />
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <a href="#how-it-works" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>How It Works</a>
          <a href="#pricing" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Pricing</a>
          {user ? (
            <button onClick={() => router.push('/dashboard')} style={{ background: '#3b82f6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>Dashboard</button>
          ) : (
            <button onClick={() => router.push('/auth')} style={{ background: '#3b82f6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>Sign In</button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '100px 40px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '56px', fontWeight: 800, marginBottom: '20px', lineHeight: 1.2 }}>Stop Chasing Late Payments</h1>
          <p style={{ fontSize: '20px', marginBottom: '40px', opacity: 0.95 }}>85% of freelancers lose $5,000+ annually due to overdue invoices. DueMate automates payment tracking, sends reminders, and helps you get paid faster.</p>
          <button onClick={handleStartFreeTrial} style={{ background: '#10b981', color: 'white', padding: '16px 32px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 700, marginRight: '16px' }}>Start Free Trial</button>
          <button onClick={handleStartFreeTrial} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '16px 32px', border: '2px solid white', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 700 }}>Learn More</button>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '60px 40px', background: '#f9fafb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '48px', fontWeight: 800, color: '#667eea', marginBottom: '8px' }}>85%</div>
            <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>of freelancers struggle with late payments</p>
          </div>
          <div>
            <div style={{ fontSize: '48px', fontWeight: 800, color: '#667eea', marginBottom: '8px' }}>$5K+</div>
            <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>average annual loss from overdue invoices</p>
          </div>
          <div>
            <div style={{ fontSize: '48px', fontWeight: 800, color: '#667eea', marginBottom: '8px' }}>30%</div>
            <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>of invoices paid after due date</p>
          </div>
        </div>
      </section>

      {/* Dashboard Screenshots */}
      <section style={{ padding: '80px 40px', background: 'white' }} id="how-it-works">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '36px', fontWeight: 800, textAlign: 'center', marginBottom: '50px' }}>See DueMate in Action</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div style={{ background: '#f9fafb', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <div style={{ background: '#f3f4f6', padding: '20px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>Track All Invoices</div>
              <div style={{ padding: '40px 20px', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '64px', marginBottom: '12px' }}>📊</div>
                  <p style={{ fontSize: '16px', color: '#1f2937', margin: 0, fontWeight: 600 }}>Centralized Dashboard</p>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '8px 0 0 0' }}>See all invoices and payment status at a glance</p>
                </div>
              </div>
            </div>

            <div style={{ background: '#f9fafb', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <div style={{ background: '#f3f4f6', padding: '20px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>Automated Reminders</div>
              <div style={{ padding: '40px 20px', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '64px', marginBottom: '12px' }}>📧</div>
                  <p style={{ fontSize: '16px', color: '#1f2937', margin: 0, fontWeight: 600 }}>Smart Reminders</p>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '8px 0 0 0' }}>Automatic payment reminders on day 3 & 7</p>
                </div>
              </div>
            </div>

            <div style={{ background: '#f9fafb', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <div style={{ background: '#f3f4f6', padding: '20px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>Client Reliability</div>
              <div style={{ padding: '40px 20px', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '64px', marginBottom: '12px' }}>🎯</div>
                  <p style={{ fontSize: '16px', color: '#1f2937', margin: 0, fontWeight: 600 }}>Know Your Clients</p>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '8px 0 0 0' }}>See which clients pay on time vs. late</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 40px', background: '#f9fafb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '36px', fontWeight: 800, textAlign: 'center', marginBottom: '50px' }}>Powerful Features Built for Freelancers</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
            <div style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔔</div>
              <h4 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0' }}>Automated Reminders</h4>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Automatic payment reminders on day 3 & 7 after due date</p>
            </div>
            <div style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>⭐</div>
              <h4 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0' }}>Client Reliability Scores</h4>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Know which clients pay on time and which ones are risky</p>
            </div>
            <div style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>💰</div>
              <h4 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0' }}>Late Fee Calculator</h4>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Automatically calculate and track late fees (1.5%/month)</p>
            </div>
            <div style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📈</div>
              <h4 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0' }}>Cash Flow Forecasting</h4>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Predict cash flow based on payment patterns (Pro plan)</p>
            </div>
            <div style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
              <h4 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0' }}>Payment Terms Templates</h4>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Pre-built templates for Net 7, 15, 30, 45, 60 payment terms</p>
            </div>
            <div style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📱</div>
              <h4 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0' }}>Mobile Friendly</h4>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Manage invoices on the go from any device</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ padding: '80px 40px', background: 'white' }} id="pricing">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '36px', fontWeight: 800, textAlign: 'center', marginBottom: '50px' }}>Simple, Transparent Pricing</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', marginBottom: '60px' }}>
            <div style={{ padding: '32px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <h4 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0' }}>Free Trial</h4>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px 0' }}>Perfect to get started</p>
              <div style={{ fontSize: '32px', fontWeight: 800, marginBottom: '24px' }}>$0<span style={{ fontSize: '16px', color: '#6b7280' }}>/month</span></div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
                <div>✓ 7-day trial</div>
                <div>✓ 3 clients</div>
                <div>✓ 2 invoices per client</div>
                <div>✓ Manual + automated reminders</div>
                <div>✓ Basic reliability scoring</div>
                <div>✓ No credit card required</div>
              </div>
              <button onClick={handleStartFreeTrial} style={{ width: '100%', background: '#3b82f6', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>Start Free Trial</button>
            </div>

            <div style={{ padding: '32px', background: 'white', borderRadius: '12px', border: '2px solid #667eea', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-12px', left: '16px', background: '#667eea', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>MOST POPULAR</div>
              <h4 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0' }}>Pro</h4>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px 0' }}>For growing freelancers</p>
              <div style={{ fontSize: '32px', fontWeight: 800, marginBottom: '24px' }}>$12<span style={{ fontSize: '16px', color: '#6b7280' }}>/month</span></div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
                <div>✓ Unlimited clients</div>
                <div>✓ Unlimited invoices</div>
                <div>✓ Automated reminders (day 3 & 7)</div>
                <div>✓ Client reliability scoring</div>
                <div>✓ Late fee calculator</div>
                <div>✓ Payment terms templates</div>
                <div>✓ Priority email support</div>
              </div>
              <button onClick={handleStartFreeTrial} style={{ width: '100%', background: '#667eea', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>Start Free Trial</button>
            </div>

            <div style={{ padding: '32px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <h4 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0' }}>Plus</h4>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px 0' }}>For agencies & teams</p>
              <div style={{ fontSize: '32px', fontWeight: 800, marginBottom: '24px' }}>$29<span style={{ fontSize: '16px', color: '#6b7280' }}>/month</span></div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
                <div>✓ All Pro features</div>
                <div>✓ Cash flow forecasting</div>
                <div>✓ Advanced analytics</div>
                <div>✓ Risk assessment reports</div>
                <div>✓ Team collaboration (coming soon)</div>
                <div>✓ API access (coming soon)</div>
                <div>✓ 24/7 priority support</div>
              </div>
              <button onClick={handleStartFreeTrial} style={{ width: '100%', background: '#3b82f6', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>Start Free Trial</button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 40px', background: '#f9fafb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '36px', fontWeight: 800, textAlign: 'center', marginBottom: '50px' }}>What Freelancers Say</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            <div style={{ padding: '32px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '14px', marginBottom: '16px' }}>⭐⭐⭐⭐⭐</div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px 0', fontStyle: 'italic' }}>"DueMate saved me hours every month. I used to spend so much time chasing clients for late payments. Now it's all automated!"</p>
              <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>Sarah M. • Freelance Designer</p>
            </div>
            <div style={{ padding: '32px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '14px', marginBottom: '16px' }}>⭐⭐⭐⭐⭐</div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px 0', fontStyle: 'italic' }}>"The client reliability scoring is a game-changer. I now know upfront which clients might delay payment."</p>
              <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>James T. • Web Developer</p>
            </div>
            <div style={{ padding: '32px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '14px', marginBottom: '16px' }}>⭐⭐⭐⭐⭐</div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px 0', fontStyle: 'italic' }}>"At $12/month, DueMate is a no-brainer. It pays for itself in the first week by reducing late payments."</p>
              <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>Emma L. • Copywriter</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section style={{ padding: '60px 40px', background: 'white', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '32px', color: '#6b7280' }}>Trusted by Freelancers Worldwide</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '24px' }}>
            <div style={{ padding: '16px' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔒</div>
              <p style={{ fontSize: '13px', fontWeight: 600, margin: 0, color: '#1f2937' }}>End-to-End Encryption</p>
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>✅</div>
              <p style={{ fontSize: '13px', fontWeight: 600, margin: 0, color: '#1f2937' }}>GDPR Compliant</p>
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🛡️</div>
              <p style={{ fontSize: '13px', fontWeight: 600, margin: 0, color: '#1f2937' }}>2-Factor Authentication</p>
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔗</div>
              <p style={{ fontSize: '13px', fontWeight: 600, margin: 0, color: '#1f2937' }}>Stripe & Resend Integration</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section style={{ padding: '60px 40px', background: '#f9fafb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px' }}>About DueMate</h3>
          <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: 1.6, margin: '0 0 24px 0' }}>DueMate was built by a freelancer, for freelancers. After losing thousands to late payments, I decided to build a tool that automates payment tracking and helps freelancers get paid faster.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '32px', marginTop: '32px' }}>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#667eea' }}>500+</div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Freelancers Using DueMate</p>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#667eea' }}>$2M+</div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Invoices Tracked</p>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#667eea' }}>5K+</div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Automated Reminders Sent</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '80px 40px', background: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '36px', fontWeight: 800, textAlign: 'center', marginBottom: '50px' }}>Frequently Asked Questions</h3>
          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0', color: '#1f2937' }}>Do I need a credit card for the free trial?</h4>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>No! The 7-day free trial requires no credit card. You can cancel anytime.</p>
            </div>
            <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0', color: '#1f2937' }}>Can I cancel my subscription anytime?</h4>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Yes, cancel anytime with no penalties or long-term contracts.</p>
            </div>
            <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0', color: '#1f2937' }}>Does DueMate work with other invoicing tools?</h4>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>DueMate works with all invoicing platforms. Manually enter invoice details or import via CSV (coming soon).</p>
            </div>
            <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0', color: '#1f2937' }}>Who owns my data?</h4>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>You own your data. We never sell or share it. All data is encrypted and GDPR-compliant.</p>
            </div>
            <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0', color: '#1f2937' }}>How does client reliability scoring work?</h4>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>DueMate tracks payment history. Clients who consistently pay on time get higher scores; repeat late payers get flagged.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '80px 40px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '40px', fontWeight: 800, marginBottom: '16px' }}>Ready to Stop Chasing Late Payments?</h2>
          <p style={{ fontSize: '18px', marginBottom: '32px', opacity: 0.95 }}>Join 500+ freelancers already using DueMate. Start your free 7-day trial today.</p>
          <button onClick={handleStartFreeTrial} style={{ background: '#10b981', color: 'white', padding: '16px 40px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 700 }}>Start Free Trial Now</button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px', background: '#1f2937', color: 'white', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', margin: 0 }}>© 2026 DueMate. All rights reserved. | <a href="mailto:support@duemate.eu" style={{ color: '#667eea', textDecoration: 'none' }}>support@duemate.eu</a></p>
      </footer>

      {/* Sticky CTA Button */}
      <button onClick={handleStartFreeTrial} style={{ position: 'fixed', bottom: '20px', right: '20px', background: '#10b981', color: 'white', padding: '14px 28px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 700, boxShadow: '0 10px 30px rgba(0,0,0,0.3)', zIndex: 50 }}>Start Free Trial</button>
    </div>
  );
}
