import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: string;
}

interface Client {
  id: string;
  name: string;
}

export default function ClientPortal() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchClientData = async () => {
      try {
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', id)
          .single();

        if (clientError) throw clientError;
        setClient(clientData);

        const { data: invoicesData, error: invoicesError } = await supabase
          .from('invoices')
          .select('*')
          .eq('client_id', id)
          .order('due_date', { ascending: false });

        if (invoicesError) throw invoicesError;
        setInvoices(invoicesData || []);
        setLoading(false);
      } catch (err: any) {
        console.error('Error:', err);
        setError('Unable to load invoices. Please check the link.');
        setLoading(false);
      }
    };

    fetchClientData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#1a1a1a' }}>
        <div style={{ maxWidth: '500px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>Error</h1>
          <p style={{ fontSize: '16px', color: '#666' }}>{error}</p>
        </div>
      </div>
    );
  }

  const totalOwed = invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = invoices.filter(inv => inv.status !== 'pending').reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#1a1a1a' }}>
      {/* Header */}
      <div style={{ padding: '40px 64px', borderBottom: '1px solid #f0f0f0' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>Invoice Status</h1>
        <p style={{ fontSize: '16px', color: '#666' }}>Hello {client?.name}! Here's your invoice status.</p>
      </div>

      {/* Main Content */}
      <div style={{ padding: '40px 64px', maxWidth: '900px', margin: '0 auto' }}>
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
          <div style={{ padding: '24px', background: '#f8f8f8', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <p style={{ fontSize: '12px', color: '#999', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>Total Invoices</p>
            <div style={{ fontSize: '32px', fontWeight: '700' }}>{invoices.length}</div>
          </div>
          <div style={{ padding: '24px', background: '#f8f8f8', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <p style={{ fontSize: '12px', color: '#999', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>Amount Paid</p>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#166534' }}>${totalPaid.toFixed(2)}</div>
          </div>
          <div style={{ padding: '24px', background: '#f8f8f8', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <p style={{ fontSize: '12px', color: '#999', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>Amount Due</p>
            <div style={{ fontSize: '32px', fontWeight: '700', color: totalOwed > 0 ? '#991b1b' : '#166534' }}>${totalOwed.toFixed(2)}</div>
          </div>
        </div>

        {/* Invoices Table */}
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>Your Invoices</h2>
          
          {invoices.length > 0 ? (
            <div style={{ background: '#f8f8f8', borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
              {invoices.map((inv, i) => {
                const isOverdue = inv.status === 'pending' && new Date(inv.due_date) < new Date();
                const daysOverdue = isOverdue 
                  ? Math.floor((new Date().getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24))
                  : 0;

                return (
                  <div key={inv.id} style={{ padding: '20px', borderBottom: i < invoices.length - 1 ? '1px solid #e0e0e0' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: '600', marginBottom: '4px', fontSize: '16px' }}>Invoice #{inv.invoice_number}</p>
                      <p style={{ fontSize: '14px', color: '#666' }}>
                        Due: {inv.due_date}
                        {isOverdue && <span style={{ color: '#991b1b', fontWeight: '600' }}> • {daysOverdue} days overdue</span>}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>${inv.amount.toFixed(2)}</div>
                        <span style={{ 
                          background: inv.status === 'paid_on_time' ? '#dcfce7' : inv.status === 'paid_late' ? '#fed7aa' : '#fef3c7', 
                          color: inv.status === 'paid_on_time' ? '#166534' : inv.status === 'paid_late' ? '#9a3412' : '#92400e',
                          padding: '4px 12px', 
                          borderRadius: '4px', 
                          fontSize: '12px', 
                          fontWeight: '600'
                        }}>
                          {inv.status === 'pending' ? 'Pending' : inv.status === 'paid_on_time' ? 'Paid' : 'Paid Late'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ background: '#f8f8f8', padding: '40px', borderRadius: '8px', textAlign: 'center', color: '#999' }}>
              No invoices yet
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid #f0f0f0', textAlign: 'center', color: '#666', fontSize: '14px' }}>
          <p>Questions? Contact the freelancer directly for payment details or inquiries.</p>
          <p style={{ marginTop: '8px' }}>Powered by <strong>DueMate</strong></p>
        </div>
      </div>
    </div>
  );
}
