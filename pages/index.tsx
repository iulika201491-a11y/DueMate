import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        router.push('/dashboard');
      }
      setLoading(false);
    };
    checkSession();
  }, [router]);

  if (loading) 
    return (
      <div style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'white', fontSize: '20px' }}>Loading...</div>
      </div>
    );

  return (
    <div style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed, #ec4899)', minHeight: '100vh', color: 'white', overflow: 'hidden' }}>
      {/* Navigation */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>DueMate</h1>
        <button
          onClick={() => router.push('/auth')}
          style={{ padding: '8px 24px', background: 'white', color: '#7c3aed', fontWeight: 'bold', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px' }}
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '60px 32px', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '24px', lineHeight: '1.2' }}>Never Chase Late Payments Again</h2>
        <p style={{ fontSize: '18px', marginBottom: '32px', opacity: 0.95 }}>
          Track payment behavior, predict late payers, and get smart alerts. Built for freelancers who value their time.
        </p>
        <button
          onClick={() => router.push('/auth')}
          style={{ padding: '14px 32px', background: 'white', color: '#7c3aed', fontWeight: 'bold', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)' }}
        >
          Get Started Free
        </button>
      </div>

      {/* Stats Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto', padding: '0 32px 60px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '32px', textAlign: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <div style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '8px' }}>85%</div>
          <p style={{ fontSize: '16px', opacity: 0.9 }}>of freelancers get paid late</p>
        </div>
        <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '32px', textAlign: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <div style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '8px' }}>21%</div>
          <p style={{ fontSize: '16px', opacity: 0.9 }}>pay late more than half the time</p>
        </div>
        <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '32px', textAlign: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
  <div style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '8px' }}>45 days</div>
  <p style={{ fontSize: '16px', opacity: 0.9 }}>average payment delay</p>
</div>

      </div>

      {/* Features Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto', padding: '0 32px 80px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '32px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Payment Patterns</h3>
          <p style={{ opacity: 0.9 }}>See which clients pay late and by how many days on average.</p>
        </div>
        <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '32px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Smart Alerts</h3>
          <p style={{ opacity: 0.9 }}>Get notified when invoices become overdue so you never forget.</p>
        </div>
        <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '32px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Clear Dashboard</h3>
          <p style={{ opacity: 0.9 }}>One simple view of all your invoices and payment health.</p>
        </div>
      </div>
    </div>
  );
}
