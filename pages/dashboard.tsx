import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

interface Client {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface Invoice {
  id: string;
  client_id: string;
  invoice_number: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: string;
  created_at: string;
}

interface ClientScore {
  reliabilityScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical' | 'unknown';
  totalInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  avgDaysToPay: number;
}

interface Subscription {
  status: string;
  invoiceLimit: number;
  clientLimit: number;
  daysLeftInTrial: number;
  trialEndsAt: string;
  plan?: string;
}

interface CashFlowForecast {
  totalOwed: number;
  projectedIncome: number;
  projectedDate: string;
  breakdown: any[];
  accuracy: string;
  message: string | null;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientScores, setClientScores] = useState<{ [key: string]: ClientScore }>({});
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '' });
  const [newInvoice, setNewInvoice] = useState({ client_id: '', invoice_number: '', amount: '', due_date: '' });
  const [clientLoading, setClientLoading] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cashFlowForecast, setCashFlowForecast] = useState<CashFlowForecast | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        router.push('/auth');
        return;
      }
      setUser(data.session.user);
      await fetchData(data.session.user.id);
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const fetchCashFlowForecast = async (userId: string) => {
    setForecastLoading(true);
    try {
      const res = await fetch('/api/forecast-cashflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      setCashFlowForecast(data);
    } catch (err) {
      console.error('Forecast error:', err);
    } finally {
      setForecastLoading(false);
    }
  };

  const fetchData = async (userId: string) => {
    try {
      const subRes = await fetch('/api/check-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const subData = await subRes.json();
      setSubscription(subData);

      const { data: clientsData } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId);
      setClients(clientsData || []);

      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: false });
      setInvoices(invoicesData || []);

      // Fetch cash flow forecast
      await fetchCashFlowForecast(userId);

      // Calculate scores for all clients
      if (clientsData) {
        const scores: { [key: string]: ClientScore } = {};
        for (const client of clientsData) {
          const scoreRes = await fetch('/api/calculate-client-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, clientId: client.id }),
          });
          const scoreData = await scoreRes.json();
          scores[client.id] = scoreData;
        }
        setClientScores(scores);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const addClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newClient.name) {
      setError('Client name is required');
      return;
    }

    if (subscription && clients.length >= subscription.clientLimit) {
      setError(`You've reached the limit of ${subscription.clientLimit} clients. Upgrade to Pro for unlimited.`);
      return;
    }

    setClientLoading(true);
    try {
      const { error: err } = await supabase
        .from('clients')
        .insert([{ user_id: user.id, name: newClient.name, email: newClient.email }]);

      if (err) throw err;

      setNewClient({ name: '', email: '' });
      setShowClientForm(false);
      setSuccess('Client added successfully');
      await fetchData(user.id);
    } catch (err: any) {
      setError(err.message || 'Failed to add client');
    } finally {
      setClientLoading(false);
    }
  };

  const addInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newInvoice.client_id || !newInvoice.invoice_number || !newInvoice.amount || !newInvoice.due_date) {
      setError('All fields are required');
      return;
    }

    if (subscription && invoices.length >= subscription.invoiceLimit) {
      setError(`You've reached the limit of ${subscription.invoiceLimit} invoices. Upgrade to Pro for unlimited.`);
      return;
    }

    setInvoiceLoading(true);
    try {
      const { error: err } = await supabase
        .from('invoices')
        .insert([{
          user_id: user.id,
          client_id: newInvoice.client_id,
          invoice_number: newInvoice.invoice_number,
          amount: parseFloat(newInvoice.amount),
          due_date: newInvoice.due_date,
          status: 'pending',
        }]);

      if (err) throw err;

      // Schedule automatic reminders
      const { data: insertedInvoice } = await supabase
        .from('invoices')
        .select('id')
        .eq('user_id', user.id)
        .eq('invoice_number', newInvoice.invoice_number)
        .single();

      if (insertedInvoice) {
        await fetch('/api/schedule-reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            invoiceId: insertedInvoice.id,
            dueDate: newInvoice.due_date
          })
        });
      }

      setNewInvoice({ client_id: '', invoice_number: '', amount: '', due_date: '' });
      setShowInvoiceForm(false);
      setSuccess('Invoice added successfully. Reminders scheduled automatically.');
      await fetchData(user.id);
    } catch (err: any) {
      setError(err.message || 'Failed to add invoice');
    } finally {
      setInvoiceLoading(false);
    }
  };

  const markInvoicePaid = async (invoiceId: string, dueDate: string) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(dueDate);
      due.setHours(0, 0, 0, 0);

      const isPastDue = due < today;
      const { error: err } = await supabase
        .from('invoices')
        .update({ status: isPastDue ? 'paid_late' : 'paid_on_time', paid_date: new Date().toISOString().split('T')[0] })
        .eq('id', invoiceId);

      if (err) throw err;
      setSuccess('Invoice marked as paid');
      await fetchData(user.id);
    } catch (err: any) {
      setError(err.message || 'Failed to mark invoice as paid');
    }
  };

  const sendAlertEmailToYou = async (invoice: Invoice, client: Client) => {
    try {
      const daysOverdue = Math.floor((new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24));
      const res = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailType: 'alert',
          recipientEmail: user.email,
          clientName: client.name,
          invoiceNumber: invoice.invoice_number,
          daysOverdue: Math.max(0, daysOverdue),
          amount: invoice.amount,
          freelancerName: user.user_metadata?.name || 'Freelancer',
        }),
      });
      const data = await res.json();
      if (data.success) setSuccess('Alert email sent to you');
      else setError('Failed to send email');
    } catch (err: any) {
      setError('Error sending email: ' + err.message);
    }
  };

  const sendReminderEmailToClient = async (invoice: Invoice, client: Client) => {
    if (!client.email) {
      setError('Client email not found');
      return;
    }
    try {
      const daysOverdue = Math.floor((new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24));
      const res = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailType: 'reminder',
          recipientEmail: client.email,
          clientName: client.name,
          invoiceNumber: invoice.invoice_number,
          daysOverdue: Math.max(0, daysOverdue),
          amount: invoice.amount,
          freelancerName: user.user_metadata?.name || 'Freelancer',
        }),
      });
      const data = await res.json();
      if (data.success) setSuccess('Reminder email sent to client');
      else setError('Failed to send email');
    } catch (err: any) {
      setError('Error sending email: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading...</div>
      </div>
    );
  }

  const allPendingInvoices = invoices.filter(inv => inv.status === 'pending');
  const overdueInvoices = allPendingInvoices.filter(inv => new Date(inv.due_date) < new Date());
  const totalOwed = allPendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const latePayments = invoices.filter(inv => inv.status === 'paid_late').length;

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return { bg: '#dcfce7', text: '#166534' };
      case 'medium': return { bg: '#fef3c7', text: '#92400e' };
      case 'high': return { bg: '#fee2e2', text: '#991b1b' };
      case 'critical': return { bg: '#fee2e2', text: '#7f1d1d' };
      default: return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#1a1a1a' }}>
      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 64px', borderBottom: '1px solid #f0f0f0' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Dashboard</h1>
        <button
          onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
          style={{ background: '#f0f0f0', color: '#1a1a1a', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
        >
          Sign Out
        </button>
      </div>

      {/* Trial Banner */}
      {subscription?.status === 'trial' && (
        <div style={{ background: '#f0f4ff', padding: '16px 64px', borderBottom: '1px solid #e0e8ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '14px', color: '#1e40af', fontWeight: '600' }}>Free Trial ({subscription.daysLeftInTrial} days left)</p>
            <p style={{ fontSize: '13px', color: '#1e40af', opacity: 0.8 }}>Upgrade to Pro or Plus for unlimited invoices and clients.</p>
          </div>
          <button
            onClick={() => router.push('/pricing')}
            style={{ background: '#1e40af', color: 'white', padding: '8px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
          >
            Upgrade Now
          </button>
        </div>
      )}

      {/* Main Content */}
      <div style={{ padding: '40px 64px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Alerts */}
        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '6px', marginBottom: '24px', fontSize: '14px' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', color: '#166534', padding: '12px 16px', borderRadius: '6px', marginBottom: '24px', fontSize: '14px' }}>
            {success}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '40px', marginBottom: '40px', borderBottom: '1px solid #f0f0f0', paddingBottom: '16px' }}>
          {['overview', 'invoices', 'clients'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: activeTab === tab ? '700' : '500',
                color: activeTab === tab ? '#1a1a1a' : '#999',
                paddingBottom: '8px',
                borderBottom: activeTab === tab ? '2px solid #1a1a1a' : 'none',
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
              <div style={{ padding: '24px', background: '#f8f8f8', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                <p style={{ fontSize: '12px', color: '#999', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>Total Owed</p>
                <div style={{ fontSize: '32px', fontWeight: '700' }}>${totalOwed.toFixed(2)}</div>
              </div>
              <div style={{ padding: '24px', background: '#f8f8f8', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                <p style={{ fontSize: '12px', color: '#999', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>Overdue Invoices</p>
                <div style={{ fontSize: '32px', fontWeight: '700' }}>{overdueInvoices.length}</div>
              </div>
              <div style={{ padding: '24px', background: '#f8f8f8', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                <p style={{ fontSize: '12px', color: '#999', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>Late Payments</p>
                <div style={{ fontSize: '32px', fontWeight: '700' }}>{latePayments}</div>
              </div>
            </div>

            {/* CASH FLOW FORECAST */}
            {subscription?.status === 'active' && subscription.plan === 'plus' && cashFlowForecast && !cashFlowForecast.message && (
              <div style={{ marginBottom: '40px', padding: '24px', background: '#f0f4ff', borderRadius: '8px', border: '1px solid #e0e8ff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>💰 Cash Flow Forecast</h3>
                    <p style={{ fontSize: '14px', color: '#666' }}>Based on your clients' payment history</p>
                  </div>
                  <span style={{ background: '#e0e8ff', color: '#1e40af', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                    {cashFlowForecast.accuracy}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#666', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>Projected Income</p>
                    <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>${cashFlowForecast.projectedIncome.toFixed(2)}</div>
                    <p style={{ fontSize: '14px', color: '#666' }}>Should arrive by <strong>{cashFlowForecast.projectedDate}</strong></p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#666', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>Payment Timeline</p>
                    {cashFlowForecast.breakdown.length > 0 && (
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        <p style={{ marginBottom: '8px' }}>📅 Next payment: <strong>{cashFlowForecast.breakdown[0].projectedPayDate}</strong></p>
                        <p>({cashFlowForecast.breakdown[0].daysUntilPayment} days from now)</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e0e8ff' }}>
                  <p style={{ fontSize: '12px', color: '#666', fontWeight: '600', marginBottom: '16px', textTransform: 'uppercase' }}>Payment Schedule</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {cashFlowForecast.breakdown.slice(0, 5).map((item: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'white', borderRadius: '6px' }}>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>Invoice #{item.invoiceNumber}</p>
                          <p style={{ fontSize: '12px', color: '#666' }}>{item.projectedPayDate} ({item.daysUntilPayment} days)</p>
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e40af' }}>${item.amount.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PLUS FEATURE TEASER */}
            {subscription?.status === 'active' && subscription.plan !== 'plus' && (
              <div style={{ marginBottom: '40px', padding: '24px', background: '#f3f0ff', borderRadius: '8px', border: '2px dashed #7c3aed' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>💰 Cash Flow Forecasting (Plus Feature)</h3>
                    <p style={{ fontSize: '14px', color: '#666' }}>See exactly when your invoices will be paid based on client history.</p>
                  </div>
                  <button
                    onClick={() => router.push('/pricing')}
                    style={{ background: '#7c3aed', color: 'white', padding: '8px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap' }}
                  >
                    Upgrade to Plus
                  </button>
                </div>
              </div>
            )}

            {/* All Pending Invoices */}
            {allPendingInvoices.length > 0 && (
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Pending Invoices</h3>
                <div style={{ background: '#f8f8f8', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                  {allPendingInvoices.map((inv, idx) => {
                    const client = clients.find(c => c.id === inv.client_id);
                    const daysOverdue = Math.floor((new Date().getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24));
                    const isOverdue = new Date(inv.due_date) < new Date();
                    const score = clientScores[inv.client_id];

                    return (
                      <div key={inv.id} style={{ padding: '16px', borderBottom: idx < allPendingInvoices.length - 1 ? '1px solid #e0e0e0' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontWeight: '600', marginBottom: '4px' }}>Invoice #{inv.invoice_number}</p>
                          <p style={{ fontSize: '14px', color: '#666' }}>
                            {client?.name} • ${inv.amount.toFixed(2)} • Due {inv.due_date}
                            {isOverdue && ` • ${daysOverdue} days overdue`}
                            {score && ` • Client reliability: ${score.reliabilityScore}%`}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => markInvoicePaid(inv.id, inv.due_date)}
                            style={{ background: '#e8f5e9', color: '#2e7d32', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                          >
                            ✓ Mark Paid
                          </button>
                          <button
                            onClick={() => sendAlertEmailToYou(inv, client!)}
                            style={{ background: '#f3e5f5', color: '#6a1b9a', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                          >
                            🔔 Alert Me
                          </button>
                          <button
                            onClick={() => sendReminderEmailToClient(inv, client!)}
                            style={{ background: '#e3f2fd', color: '#1565c0', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                          >
                            📧 Remind
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* INVOICES TAB */}
        {activeTab === 'invoices' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700' }}>All Invoices</h3>
              <button
                onClick={() => setShowInvoiceForm(!showInvoiceForm)}
                style={{ background: '#1a1a1a', color: 'white', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
              >
                {showInvoiceForm ? '✕ Cancel' : '+ New Invoice'}
              </button>
            </div>

            {/* Share Client Portal */}
            {invoices.length > 0 && clients.length > 0 && (
              <div style={{ marginBottom: '24px', padding: '16px', background: '#e3f2fd', borderRadius: '8px', border: '1px solid #bbdefb' }}>
                <p style={{ fontSize: '14px', color: '#1565c0', fontWeight: '600', marginBottom: '12px' }}>
                  💡 Tip: Share invoice status with clients to reduce follow-ups
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {clients.map(client => (
                    <div key={client.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <input
                        type="text"
                        readOnly
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/client/${client.id}`}
                        style={{ flex: 1, padding: '8px 12px', border: '1px solid #90caf9', borderRadius: '6px', fontSize: '12px', background: 'white' }}
                      />
                      <button
                        onClick={() => {
                          const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/client/${client.id}`;
                          navigator.clipboard.writeText(url);
                          setSuccess(`Copied ${client.name}'s portal link!`);
                        }}
                        style={{ background: '#1565c0', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '12px', whiteSpace: 'nowrap' }}
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showInvoiceForm && (
              <form onSubmit={addInvoice} style={{ background: '#f8f8f8', padding: '24px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #e0e0e0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                  <select
                    value={newInvoice.client_id}
                    onChange={e => setNewInvoice({ ...newInvoice, client_id: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #d0d0d0', borderRadius: '6px', fontSize: '14px' }}
                  >
                    <option value="">Select client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input
                    type="text"
                    placeholder="Invoice number"
                    value={newInvoice.invoice_number}
                    onChange={e => setNewInvoice({ ...newInvoice, invoice_number: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #d0d0d0', borderRadius: '6px', fontSize: '14px' }}
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={newInvoice.amount}
                    onChange={e => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #d0d0d0', borderRadius: '6px', fontSize: '14px' }}
                  />
                  <input
                    type="date"
                    value={newInvoice.due_date}
                    onChange={e => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #d0d0d0', borderRadius: '6px', fontSize: '14px' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={invoiceLoading}
                  style={{ background: '#1a1a1a', color: 'white', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: invoiceLoading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px' }}
                >
                  {invoiceLoading ? 'Adding...' : 'Add Invoice'}
                </button>
              </form>
            )}

            {invoices.length > 0 ? (
              <div style={{ background: '#f8f8f8', borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                {invoices.map((inv, i) => (
                  <div key={inv.id} style={{ padding: '16px', borderBottom: i < invoices.length - 1 ? '1px solid #e0e0e0' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: '600', marginBottom: '4px' }}>Invoice #{inv.invoice_number}</p>
                      <p style={{ fontSize: '14px', color: '#666' }}>{clients.find(c => c.id === inv.client_id)?.name} • ${inv.amount.toFixed(2)} • Due {inv.due_date}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ background: inv.status === 'paid_on_time' ? '#dcfce7' : inv.status === 'paid_late' ? '#fed7aa' : '#fef3c7', color: inv.status === 'paid_on_time' ? '#166534' : inv.status === 'paid_late' ? '#9a3412' : '#92400e', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                        {inv.status === 'pending' ? 'Pending' : inv.status === 'paid_on_time' ? 'Paid On Time' : 'Paid Late'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: '#f8f8f8', padding: '40px', borderRadius: '8px', textAlign: 'center', color: '#999' }}>
                No invoices yet
              </div>
            )}
          </div>
        )}

        {/* CLIENTS TAB */}
        {activeTab === 'clients' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Clients</h3>
              <button
                onClick={() => setShowClientForm(!showClientForm)}
                style={{ background: '#1a1a1a', color: 'white', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
              >
                {showClientForm ? '✕ Cancel' : '+ New Client'}
              </button>
            </div>

            {showClientForm && (
              <form onSubmit={addClient} style={{ background: '#f8f8f8', padding: '24px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #e0e0e0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                  <input
                    type="text"
                    placeholder="Client name"
                    value={newClient.name}
                    onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #d0d0d0', borderRadius: '6px', fontSize: '14px' }}
                  />
                  <input
                    type="email"
                    placeholder="Email (optional)"
                    value={newClient.email}
                    onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #d0d0d0', borderRadius: '6px', fontSize: '14px' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={clientLoading}
                  style={{ background: '#1a1a1a', color: 'white', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: clientLoading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px' }}
                >
                  {clientLoading ? 'Adding...' : 'Add Client'}
                </button>
              </form>
            )}

            {clients.length > 0 ? (
              <div style={{ background: '#f8f8f8', borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                {clients.map((client, i) => {
                  const score = clientScores[client.id];
                  const riskColor = score ? getRiskColor(score.riskLevel) : getRiskColor('unknown');

                  return (
                    <div key={client.id} style={{ padding: '16px', borderBottom: i < clients.length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <p style={{ fontWeight: '600', fontSize: '16px' }}>{client.name}</p>
                        {score && (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
                              {score.reliabilityScore}%
                            </span>
                            <span style={{ background: riskColor.bg, color: riskColor.text, padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' }}>
                              {score.riskLevel}
                            </span>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', fontSize: '14px', color: '#666' }}>
                        <div>
                          <p style={{ fontSize: '12px', color: '#999', fontWeight: '600', marginBottom: '4px' }}>TOTAL INVOICES</p>
                          <p style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>{score?.totalInvoices || 0}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '12px', color: '#999', fontWeight: '600', marginBottom: '4px' }}>PAID</p>
                          <p style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>{score?.paidInvoices || 0}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '12px', color: '#999', fontWeight: '600', marginBottom: '4px' }}>OVERDUE</p>
                          <p style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>{score?.overdueInvoices || 0}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '12px', color: '#999', fontWeight: '600', marginBottom: '4px' }}>AVG DAYS TO PAY</p>
                          <p style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>{score?.avgDaysToPay || 0} days</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ background: '#f8f8f8', padding: '40px', borderRadius: '8px', textAlign: 'center', color: '#999' }}>
                No clients yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
