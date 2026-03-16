import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Contact() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to send message');

      setMessage({ type: 'success', text: 'Thank you! We received your message and will get back to you soon.' });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to send message' });
    } finally {
      setLoading(false);
    }
  };

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
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '12px' }}>Contact Us</h2>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
          Have a question, feedback, or feature request? We'd love to hear from you. Fill out the form below and we'll get back to you shortly.
        </p>

        {message.text && (
          <div
            style={{
              background: message.type === 'error' ? '#fee2e2' : '#dcfce7',
              color: message.type === 'error' ? '#991b1b' : '#166534',
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '24px',
              fontSize: '14px',
              border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
              placeholder="Your name"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
              placeholder="your@email.com"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
              placeholder="How can we help?"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', minHeight: '150px', fontFamily: 'inherit' }}
              placeholder="Tell us what's on your mind..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: '#1a1a1a',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        <div style={{ marginTop: '32px', padding: '24px', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Or email us directly:</p>
          <a href="mailto:support@duemate.eu" style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a', textDecoration: 'none' }}>
            support@duemate.eu
          </a>
        </div>
      </div>
    </div>
  );
}
