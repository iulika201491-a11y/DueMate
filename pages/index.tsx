import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        router.push('/dashboard');
      }
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  if (loading) return null;

  return (
    <div style={{ background: '#ffffff', color: '#1a1a1a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Navigation */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 64px', borderBottom: '1px solid #f0f0f0' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>DueMate</h1>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <button onClick={() => router.push('/pricing')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#666' }}>Pricing</button>
          <button onClick={() => router.push('/auth')} style={{ background: '#1a1a1a', color: 'white', padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}>Sign In</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '120px 64px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ maxWidth: '700px' }}>
          <h2 style={{ fontSize: '56px', fontWeight: '700', lineHeight: '1.2', marginBottom: '24px', letterSpacing: '-1px' }}>
            Stop chasing late payments
          </h2>
          <p style={{ fontSize: '20px', color: '#666', lineHeight: '1.6', marginBottom: '32px' }}>
            DueMate helps freelancers track overdue invoices, send automated reminders, and get paid on time. No more spreadsheets. No more guessing.
          </p>
          <button
            onClick={() => router.push('/auth')}
            style={{ background: '#1a1a1a', color: 'white', padding: '16px 40px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}
          >
            Start Free Trial
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ background: '#f8f8f8', padding: '80px 64px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '60px' }}>
          <div>
            <div style={{ fontSize: '48px', fontWeight: '700', color: '#1a1a1a', marginBottom: '12px' }}>85%</div>
            <p style={{ fontSize: '16px', color: '#666' }}>of freelancers receive late payments</p>
          </div>
          <div>
            <div style={{ fontSize: '48px', fontWeight: '700', color: '#1a1a1a', marginBottom: '12px' }}>$5k+</div>
            <p style={{ fontSize: '16px', color: '#666' }}>average unpaid invoices per year</p>
          </div>
          <div>
            <div><div style={{fontSize:'48px',fontWeight:700,color:'#1a1a1a',marginBottom:'12px'}}>30%</div><p style={{fontSize:'16px',color:'#666'}}>of invoices paid late</p></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 64px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '60px', textAlign: 'center' }}>Everything you need</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
            {[
              { icon: '📊', title: 'Invoice Tracking', desc: 'Monitor all invoices in one place. Know exactly which ones are overdue.' },
              { icon: '🔔', title: 'Smart Reminders', desc: 'Send automated payment reminders to clients with one click.' },
              { icon: '📈', title: 'Analytics', desc: 'See payment trends, average collection time, and late payment rates.' }
            ].map((feature, i) => (
              <div key={i} style={{ padding: '32px', background: '#f8f8f8', borderRadius: '12px' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>{feature.icon}</div>
                <h4 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>{feature.title}</h4>
                <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.6' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ background: '#1a1a1a', color: 'white', padding: '80px 64px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '24px' }}>Ready to stop chasing payments?</h3>
        <p style={{ fontSize: '18px', color: '#ccc', marginBottom: '32px' }}>Try DueMate free for 7 days. No credit card required.</p>
        <button
          onClick={() => router.push('/auth')}
          style={{ background: 'white', color: '#1a1a1a', padding: '16px 40px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}
        >
          Start Free Trial
        </button>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #f0f0f0', padding: '48px 64px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
        <p>© 2026 DueMate. All rights reserved.</p>
      </footer>
    </div>
  );
}
