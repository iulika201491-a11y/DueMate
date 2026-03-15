import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Pricing() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user || null);
      
      if (data?.session?.user) {
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', data.session.user.id)
          .single();
        
        setIsSubscribed(sub?.status === 'active');
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleCheckout = () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    window.location.href = 'https://buy.stripe.com/test_cNicN777y3ju4QO6I97Re00';
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div>Loading...</div></div>;
  }

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', color: '#1a1a1a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Navigation */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 64px', borderBottom: '1px solid #f0f0f0' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700' }}>DueMate</h1>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#666' }}>Back</button>
      </nav>

      {/* Pricing Section */}
      <section style={{ padding: '80px 64px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '48px', fontWeight: '700', textAlign: 'center', marginBottom: '12px' }}>Simple, transparent pricing</h2>
          <p style={{ fontSize: '18px', color: '#666', textAlign: 'center', marginBottom: '60px' }}>7 days free. No credit card required. Cancel anytime.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px' }}>
            {/* Free Trial */}
            <div style={{ padding: '40px', border: '1px solid #e0e0e0', borderRadius: '12px', background: '#fafafa' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Free Trial</h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>Perfect for testing</p>
              <div style={{ fontSize: '40px', fontWeight: '700', marginBottom: '24px' }}>$0<span style={{ fontSize: '16px', color: '#666' }}>/7 days</span></div>
              
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '32px' }}>
                {['5 invoices', '3 clients', 'Email alerts', 'Payment tracking'].map((item, i) => (
                  <li key={i} style={{ marginBottom: '12px', fontSize: '16px', color: '#666', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>✓</span> {item}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => user ? router.push('/dashboard') : router.push('/auth')}
                style={{ width: '100%', padding: '12px 24px', background: '#f0f0f0', color: '#1a1a1a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}
              >
                {user ? 'Access Trial' : 'Sign Up Free'}
              </button>
            </div>

            {/* Pro Plan */}
            <div style={{ padding: '40px', border: '2px solid #1a1a1a', borderRadius: '12px', background: '#1a1a1a', color: 'white', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-12px', left: '24px', background: '#1a1a1a', padding: '0 8px', fontSize: '12px', fontWeight: '700', color: '#999', letterSpacing: '1px' }}>RECOMMENDED</div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Pro</h3>
              <p style={{ fontSize: '14px', color: '#999', marginBottom: '24px' }}>Best for growing freelancers</p>
              <div style={{ fontSize: '40px', fontWeight: '700', marginBottom: '24px' }}>$12<span style={{ fontSize: '16px', color: '#999' }}>/month</span></div>
              
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '32px' }}>
                {['Unlimited invoices', 'Unlimited clients', 'Email alerts & reminders', 'Payment analytics', 'Priority support'].map((item, i) => (
                  <li key={i} style={{ marginBottom: '12px', fontSize: '16px', color: '#eee', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>✓</span> {item}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleCheckout}
                disabled={isSubscribed}
                style={{ width: '100%', padding: '12px 24px', background: isSubscribed ? '#666' : 'white', color: isSubscribed ? '#999' : '#1a1a1a', border: 'none', borderRadius: '8px', cursor: isSubscribed ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '16px' }}
              >
                {isSubscribed ? '✓ You\'re Subscribed' : 'Upgrade to Pro'}
              </button>
            </div>
          </div>

          {/* FAQ */}
          <div style={{ marginTop: '80px', maxWidth: '600px', margin: '80px auto 0' }}>
            <h3 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '40px', textAlign: 'center' }}>Frequently asked</h3>
            {[
              { q: 'Can I cancel anytime?', a: 'Yes. Cancel your subscription anytime, no questions asked.' },
              { q: 'Do you store my payment info?', a: 'No. Payments are processed securely through Stripe.' },
              { q: 'What happens after the free trial?', a: 'We\'ll remind you before your trial ends. You can upgrade, or your account will pause.' }
            ].map((faq, i) => (
              <div key={i} style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #f0f0f0' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>{faq.q}</h4>
                <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.6' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #f0f0f0', padding: '48px 64px', textAlign: 'center', color: '#666', fontSize: '14px', marginTop: '60px' }}>
        <p>© 2026 DueMate. All rights reserved.</p>
      </footer>
    </div>
  );
}
