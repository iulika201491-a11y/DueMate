import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Pricing() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user || null);
      
      if (data?.session?.user) {
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('status,plan')
          .eq('user_id', data.session.user.id)
          .single();
        
        setIsSubscribed(sub?.status === 'active');
        setCurrentPlan(sub?.plan || '');
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleCheckout = (planType: string) => {
    if (!user) {
      router.push('/auth');
      return;
    }

    // Different Stripe payment links for Pro and Plus
   const paymentLinks: any = {
  pro: 'https://buy.stripe.com/8x25kFbnqateg0n5XhdAk00',
  plus: 'https://buy.stripe.com/14AcN7cru58Ug0nadxdAk01'
};
    window.location.href = paymentLinks[planType as keyof typeof paymentLinks] || paymentLinks.pro;
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
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '48px', fontWeight: '700', textAlign: 'center', marginBottom: '12px' }}>Simple, transparent pricing</h2>
          <p style={{ fontSize: '18px', color: '#666', textAlign: 'center', marginBottom: '60px' }}>Choose the plan that fits your needs. Free trial on all plans.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', marginBottom: '60px' }}>
            
            {/* FREE TRIAL */}
            <div style={{ padding: '40px', border: '1px solid #e0e0e0', borderRadius: '12px', background: '#fafafa' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Free Trial</h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>Perfect for testing</p>
              <div style={{ fontSize: '40px', fontWeight: '700', marginBottom: '24px' }}>$0<span style={{ fontSize: '16px', color: '#666' }}>/7 days</span></div>
              
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '32px' }}>
                {['5 invoices', '3 clients', 'Email alerts', 'Payment tracking', 'Invoice management'].map((item, i) => (
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

            {/* PRO PLAN */}
            <div style={{ padding: '40px', border: '2px solid #1a1a1a', borderRadius: '12px', background: '#1a1a1a', color: 'white' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Pro</h3>
              <p style={{ fontSize: '14px', color: '#999', marginBottom: '24px' }}>Best for solo freelancers</p>
              <div style={{ fontSize: '40px', fontWeight: '700', marginBottom: '24px' }}>$12<span style={{ fontSize: '16px', color: '#999' }}>/month</span></div>
              
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '32px' }}>
                {[
                  'Unlimited invoices & clients',
                  'Email alerts & reminders',
                  'Invoice tracking',
                  'Overdue detection',
                  'Manual follow-up tools',
                  'Basic client list'
                ].map((item, i) => (
                  <li key={i} style={{ marginBottom: '12px', fontSize: '16px', color: '#eee', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>✓</span> {item}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout('pro')}
                disabled={isSubscribed && (currentPlan === 'pro' || currentPlan === 'plus')}
                style={{ width: '100%', padding: '12px 24px', background: isSubscribed && (currentPlan === 'pro' || currentPlan === 'plus') ? '#666' : 'white', color: isSubscribed && (currentPlan === 'pro' || currentPlan === 'plus') ? '#999' : '#1a1a1a', border: 'none', borderRadius: '8px', cursor: isSubscribed && (currentPlan === 'pro' || currentPlan === 'plus') ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '16px' }}
              >
                {isSubscribed && (currentPlan === 'pro' || currentPlan === 'plus') ? '✓ You\'re Subscribed' : 'Start Pro'}
              </button>
            </div>

            {/* PLUS PLAN */}
            <div style={{ padding: '40px', border: '2px solid #7c3aed', borderRadius: '12px', background: '#f8f3ff', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-12px', left: '24px', background: '#7c3aed', color: 'white', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', letterSpacing: '1px' }}>
                RECOMMENDED
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#1a1a1a' }}>Plus</h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>For growing freelancers</p>
              <div style={{ fontSize: '40px', fontWeight: '700', marginBottom: '24px', color: '#1a1a1a' }}>$29<span style={{ fontSize: '16px', color: '#666' }}>/month</span></div>
              
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '32px' }}>
                {[
                  'Everything in Pro, plus:',
                  '',
                  '⚡ Automated reminder sequences',
                  '⚡ Client reliability scoring',
                  '⚡ Cash flow forecasting',
                  '⚡ Client payment portal',
                  '⚡ Payment analytics',
                  '⚡ Priority support'
                ].map((item, i) => (
                  <li key={i} style={{ 
                    marginBottom: item === '' ? '12px' : '12px', 
                    fontSize: '16px', 
                    color: item.includes('⚡') ? '#7c3aed' : '#666',
                    fontWeight: item === 'Everything in Pro, plus:' ? '600' : '400',
                    display: item === '' ? 'none' : 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    {item.includes('⚡') ? '' : item.includes('Everything') ? '' : <span style={{ fontSize: '20px' }}>✓</span>}
                    {item}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout('plus')}
                disabled={isSubscribed && currentPlan === 'plus'}
                style={{ width: '100%', padding: '12px 24px', background: isSubscribed && currentPlan === 'plus' ? '#e0e0e0' : '#7c3aed', color: isSubscribed && currentPlan === 'plus' ? '#999' : 'white', border: 'none', borderRadius: '8px', cursor: isSubscribed && currentPlan === 'plus' ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '16px' }}
              >
                {isSubscribed && currentPlan === 'plus' ? '✓ You\'re Subscribed' : 'Start Plus'}
              </button>
            </div>
          </div>

          {/* COMPARISON TABLE */}
          <div style={{ marginTop: '80px' }}>
            <h3 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '40px', textAlign: 'center' }}>Feature comparison</h3>
            
            <div style={{ background: '#f8f8f8', borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0', borderBottom: '1px solid #e0e0e0' }}>
                <div style={{ padding: '20px', fontWeight: '600' }}>Feature</div>
                <div style={{ padding: '20px', fontWeight: '600', textAlign: 'center', borderLeft: '1px solid #e0e0e0' }}>Free Trial</div>
                <div style={{ padding: '20px', fontWeight: '600', textAlign: 'center', borderLeft: '1px solid #e0e0e0' }}>Pro</div>
                <div style={{ padding: '20px', fontWeight: '600', textAlign: 'center', borderLeft: '1px solid #e0e0e0', background: '#f3f0ff' }}>Plus</div>
              </div>

              {/* Rows */}
              {[
                { feature: 'Invoices', trial: '5', pro: 'Unlimited', plus: 'Unlimited' },
                { feature: 'Clients', trial: '3', pro: 'Unlimited', plus: 'Unlimited' },
                { feature: 'Email alerts', trial: '✓', pro: '✓', plus: '✓' },
                { feature: 'Overdue detection', trial: '✓', pro: '✓', plus: '✓' },
                { feature: 'Manual reminders', trial: '✓', pro: '✓', plus: '✓' },
                { feature: 'Automated reminders', trial: '✗', pro: '✗', plus: '✓' },
                { feature: 'Client reliability scoring', trial: '✗', pro: '✗', plus: '✓' },
                { feature: 'Cash flow forecasting', trial: '✗', pro: '✗', plus: '✓' },
                { feature: 'Client portal', trial: '✗', pro: '✗', plus: '✓' },
                { feature: 'Payment analytics', trial: '✗', pro: '✗', plus: '✓' },
                { feature: 'Priority support', trial: '✗', pro: '✗', plus: '✓' }
              ].map((row, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0', borderBottom: i < 10 ? '1px solid #e0e0e0' : 'none' }}>
                  <div style={{ padding: '16px', fontSize: '14px', fontWeight: '500' }}>{row.feature}</div>
                  <div style={{ padding: '16px', textAlign: 'center', fontSize: '14px', borderLeft: '1px solid #e0e0e0', color: row.trial === '✗' ? '#999' : '#1a1a1a' }}>
                    {row.trial}
                  </div>
                  <div style={{ padding: '16px', textAlign: 'center', fontSize: '14px', borderLeft: '1px solid #e0e0e0', color: row.pro === '✗' ? '#999' : '#1a1a1a' }}>
                    {row.pro}
                  </div>
                  <div style={{ padding: '16px', textAlign: 'center', fontSize: '14px', borderLeft: '1px solid #e0e0e0', background: '#f3f0ff', color: row.plus === '✗' ? '#999' : '#1a1a1a' }}>
                    {row.plus}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div style={{ marginTop: '80px', maxWidth: '600px', margin: '80px auto 0' }}>
            <h3 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '40px', textAlign: 'center' }}>Frequently asked</h3>
            {[
              { q: 'Can I upgrade or downgrade anytime?', a: 'Yes. Switch between Pro and Plus anytime. Your billing will adjust accordingly.' },
              { q: 'Do you offer annual discounts?', a: 'Not yet, but we\'re considering it. Email us at support@duemate.eu to discuss.' },
              { q: 'What happens after the free trial?', a: 'We\'ll remind you before expiration. You can upgrade to Pro/Plus, or your account pauses. No surprise charges.' },
              { q: 'Do you store my payment info?', a: 'No. All payments are processed securely through Stripe. We never see your card details.' }
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
