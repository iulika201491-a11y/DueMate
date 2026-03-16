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
  status: 'pending' | 'paid_on_time' | 'paid_late';
  paid_date?: string;
  created_at: string;
}

interface Subscription {
  user_id: string;
  status: 'trial' | 'active' | 'cancelled';
  plan: 'free' | 'pro' | 'plus';
  trial_ends_at?: string;
  created_at: string;
}

interface ClientScore {
  user_id: string;
  client_id: string;
  payment_reliability_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  total_invoices: number;
  paid_invoices: number;
  avg_days_to_pay: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clientScores, setClientScores] = useState<Record<string, ClientScore>>({});
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [showNewClient, setShowNewClient] = useState(false);
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '' });
  const [newInvoice, setNewInvoice] = useState({ client_id: '', invoice_number: '', amount: '', due_date: '' });
  const [loadingAction, setLoadingAction] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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

  const fetchData = async (userId: string) => {
    try {
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();
      setSubscription(subData);

      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      setClients(clientData || []);

      const { data: invoiceData } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: false });
      setInvoices(invoiceData || []);

      const { data: scoreData } = await supabase
        .from('client_statistics')
        .select('*')
        .eq('user_id', userId);
      const scoresMap = {};
      (scoreData || []).forEach((score: any) => {
        scoresMap[score.client_id] = score;
      });
      setClientScores(scoresMap);
    } catch (error) {
      console.error('Fetch error:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    }
  };

  const addClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.email) {
      setMessage({ type: 'error', text: 'Name and email are required' });
      return;
    }
    setLoadingAction(true);
    try {
      const { error } = await supabase
        .from('clients')
        .insert([{ user_id: user.id, name: newClient.name, email: newClient.email }]);
      if (error) throw error;
      setNewClient({ name: '', email: '' });
      setShowNewClient(false);
      setMessage({ type: 'success', text: 'Client added!' });
      await fetchData(user.id);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoadingAction(false);
    }
  };

  const addInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoice.client_id || !newInvoice.invoice_number || !newInvoice.amount || !newInvoice.due_date) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }
    setLoadingAction(true);
    try {
      const { error } = await supabase
        .from('invoices')
        .insert([
          {
            user_id: user.id,
            client_id: newInvoice.client_id,
            invoice_number: newInvoice.invoice_number,
            amount: parseFloat(newInvoice.amount),
            due_date: newInvoice.due_date,
            status: 'pending',
          },
        ]);
      if (error) throw error;
      setNewInvoice({ client_id: '', invoice_number: '', amount: '', due_date: '' });
      setShowNewInvoice(false);
      setMessage({ type: 'success', text: 'Invoice created!' });
      await fetchData(user.id);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoadingAction(false);
    }
  };

  const markInvoicePaid = async (invoiceId: string, dueDate: string) => {
    setLoadingAction(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(dueDate);
      due.setHours(0, 0, 0, 0);
      const isPastDue = due < today;

      const { error } = await supabase
        .from('invoices')
        .update({
          status: isPastDue ? 'paid_late' : 'paid_on_time',
          paid_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', invoiceId);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Invoice marked as paid!' });
      await fetchData(user.id);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoadingAction(false);
    }
  };

  const sendAlertEmail = async (invoice: Invoice) => {
    setLoadingAction(true);
    try {
      const client = clients.find((c) => c.id === invoice.client_id);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(invoice.due_date);
      due.setHours(0, 0, 0, 0);
      const daysOverdue = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));

      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailType: 'alert',
          recipientEmail: user.email,
          freelancerName: user.user_metadata?.full_name || 'Freelancer',
          clientName: client?.name || 'Client',
          invoiceNumber: invoice.invoice_number,
          amount: invoice.amount,
          daysOverdue: daysOverdue > 0 ? daysOverdue : 0,
        }),
      });

      if (!response.ok) throw new Error('Failed to send alert');
      setMessage({ type: 'success', text: 'Alert sent to your email!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoadingAction(false);
    }
  };

  const sendReminderEmail = async (invoice: Invoice) => {
    setLoadingAction(true);
    try {
      const client = clients.find((c) => c.id === invoice.client_id);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(invoice.due_date);
      due.setHours(0, 0, 0, 0);
      const daysOverdue = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));

      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailType: 'reminder',
          recipientEmail: client?.email,
          clientName: client?.name || 'Client',
          invoiceNumber: invoice.invoice_number,
          amount: invoice.amount,
          daysOverdue: daysOverdue > 0 ? daysOverdue : 0,
        }),
      });

      if (!response.ok) throw new Error('Failed to send reminder');
      setMessage({ type: 'success', text: 'Reminder sent to client!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoadingAction(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    const colors: any = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#7c2d12',
    };
    return colors[riskLevel] || '#6b7280';
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ fontSize: '16px', color: '#6b7280' }}>Loading...</div>
      </div>
    );
  }

  const allPendingInvoices = invoices.filter((i) => i.status === 'pending');
  const totalOwed = allPendingInvoices.reduce((s, i) => s + i.amount, 0);
  const overdueInvoices = allPendingInvoices.filter((i) => {
    const due = new Date(i.due_date);
    due.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  });
  const latePayments = invoices.filter((i) => i.status === 'paid_late').length;

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#1f2937' }}>
      {/* Navigation */}
      <nav style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>DueMate</h1>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push('/');
          }}
          style={{ background: '#ef4444', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
        >
          Sign Out
        </button>
      </nav>

      {/* Trial Banner */}
      {subscription?.status === 'trial' && (
        <div style={{ background: '#dbeafe', borderBottom: '1px solid #bfdbfe', padding: '16px 40px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#1e40af', fontWeight: 600 }}>
            🎉 You're on a free 7-day trial. Upgrade to Pro ($12/mo) or Plus ($29/mo) to unlock all features.
          </p>
          <button onClick={() => router.push('/pricing')} style={{ background: '#1e40af', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
            Upgrade Now
          </button>
        </div>
      )}

      {/* Messages */}
      {message.text && (
        <div style={{ background: message.type === 'error' ? '#fee2e2' : '#dcfce7', color: message.type === 'error' ? '#991b1b' : '#166534', padding: '12px 40px', borderBottom: '1px solid', borderColor: message.type === 'error' ? '#fecaca' : '#bbf7d0', fontSize: '14px' }}>
          {message.text}
        </div>
      )}

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '32px', marginBottom: '32px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
          {['overview', 'invoices', 'clients'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: activeTab === tab ? 700 : 500,
                color: activeTab === tab ? '#1f2937' : '#6b7280',
                paddingBottom: '8px',
                borderBottom: activeTab === tab ? '2px solid #3b82f6' : 'none',
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, marginBottom: '8px' }}>TOTAL OWED</div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#1f2937' }}>${totalOwed.toFixed(2)}</div>
                <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '8px' }}>{allPendingInvoices.length} pending invoices</div>
              </div>
              <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, marginBottom: '8px' }}>OVERDUE</div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#ef4444' }}>{overdueInvoices.length}</div>
                <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '8px' }}>invoices past due date</div>
              </div>
              <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, marginBottom: '8px' }}>PAID LATE</div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#f59e0b' }}>{latePayments}</div>
                <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '8px' }}>invoices paid after due date</div>
              </div>
            </div>

            {/* Pending Invoices */}
            {allPendingInvoices.length > 0 && (
              <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginTop: 0, marginBottom: '20px' }}>Pending Invoices</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {allPendingInvoices.map((invoice) => {
                    const client = clients.find((c) => c.id === invoice.client_id);
                    const due = new Date(invoice.due_date);
                    due.setHours(0, 0, 0, 0);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isOverdue = due < today;
                    const daysOverdue = isOverdue ? Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)) : 0;

                    return (
                      <div key={invoice.id} style={{ padding: '16px', background: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '15px', fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>
                            Invoice #{invoice.invoice_number}
                          </div>
                          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                            {client?.name || 'Unknown Client'} • ${invoice.amount.toFixed(2)} • Due {invoice.due_date}
                          </div>
                          {isOverdue && <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: 600 }}>⚠️ {daysOverdue} days overdue</div>}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => markInvoicePaid(invoice.id, invoice.due_date)}
                            disabled={loadingAction}
                            style={{
                              background: '#10b981',
                              color: 'white',
                              padding: '8px 12px',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: loadingAction ? 'not-allowed' : 'pointer',
                              fontSize: '13px',
                              fontWeight: 600,
                              opacity: loadingAction ? 0.6 : 1,
                            }}
                          >
                            ✓ Mark Paid
                          </button>
                          <button
                            onClick={() => sendAlertEmail(invoice)}
                            disabled={loadingAction}
                            style={{
                              background: '#f59e0b',
                              color: 'white',
                              padding: '8px 12px',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: loadingAction ? 'not-allowed' : 'pointer',
                              fontSize: '13px',
                              fontWeight: 600,
                              opacity: loadingAction ? 0.6 : 1,
                            }}
                          >
                            🔔 Alert
                          </button>
                          <button
                            onClick={() => sendReminderEmail(invoice)}
                            disabled={loadingAction}
                            style={{
                              background: '#3b82f6',
                              color: 'white',
                              padding: '8px 12px',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: loadingAction ? 'not-allowed' : 'pointer',
                              fontSize: '13px',
                              fontWeight: 600,
                              opacity: loadingAction ? 0.6 : 1,
                            }}
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

            {allPendingInvoices.length === 0 && (
              <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '16px', color: '#6b7280' }}>✅ No pending invoices. Great job!</div>
              </div>
            )}
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div>
            <button
              onClick={() => setShowNewInvoice(!showNewInvoice)}
              style={{ background: '#3b82f6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, marginBottom: '20px' }}
            >
              + New Invoice
            </button>

            {showNewInvoice && (
              <form onSubmit={addInvoice} style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <select
                    value={newInvoice.client_id}
                    onChange={(e) => setNewInvoice({ ...newInvoice, client_id: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                  >
                    <option value="">Select Client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Invoice Number"
                    value={newInvoice.invoice_number}
                    onChange={(e) => setNewInvoice({ ...newInvoice, invoice_number: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={newInvoice.amount}
                    onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                  />
                  <input
                    type="date"
                    value={newInvoice.due_date}
                    onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                  />
                </div>
                <button type="submit" disabled={loadingAction} style={{ background: '#10b981', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: loadingAction ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 600, opacity: loadingAction ? 0.6 : 1 }}>
                  Create Invoice
                </button>
              </form>
            )}

            <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              {invoices.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No invoices yet.</div>
              ) : (
                <div>
                  {invoices.map((invoice) => {
                    const client = clients.find((c) => c.id === invoice.client_id);
                    const statusColor = invoice.status === 'pending' ? '#3b82f6' : invoice.status === 'paid_on_time' ? '#10b981' : '#ef4444';
                    return (
                      <div key={invoice.id} style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 600, color: '#1f2937' }}>Invoice #{invoice.invoice_number}</div>
                          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                            {client?.name} • ${invoice.amount.toFixed(2)} • {invoice.due_date}
                          </div>
                        </div>
                        <div style={{ background: statusColor, color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                          {invoice.status === 'pending' ? 'Pending' : invoice.status === 'paid_on_time' ? 'Paid On Time' : 'Paid Late'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div>
            <button
              onClick={() => setShowNewClient(!showNewClient)}
              style={{ background: '#3b82f6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, marginBottom: '20px' }}
            >
              + New Client
            </button>

            {showNewClient && (
              <form onSubmit={addClient} style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <input
                    type="text"
                    placeholder="Client Name"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                  />
                </div>
                <button type="submit" disabled={loadingAction} style={{ background: '#10b981', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: loadingAction ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 600, opacity: loadingAction ? 0.6 : 1 }}>
                  Add Client
                </button>
              </form>
            )}

            <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              {clients.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No clients yet.</div>
              ) : (
                <div>
                  {clients.map((client) => {
                    const clientInvoices = invoices.filter((i) => i.client_id === client.id);
                    const totalAmount = clientInvoices.reduce((s, i) => s + i.amount, 0);
                    const paidAmount = clientInvoices.filter((i) => i.status !== 'pending').reduce((s, i) => s + i.amount, 0);
                    const score = clientScores[client.id];
                    return (
                      <div key={client.id} style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '15px', fontWeight: 600, color: '#1f2937' }}>{client.name}</div>
                          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px', marginBottom: '8px' }}>
                            {client.email} • {clientInvoices.length} invoices
                          </div>
                          <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                            ${paidAmount.toFixed(2)} paid of ${totalAmount.toFixed(2)}
                          </div>
                        </div>
                        {score && (
                          <div
                            style={{
                              background: getRiskColor(score.risk_level),
                              color: 'white',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 600,
                            }}
                          >
                            {score.risk_level.charAt(0).toUpperCase() + score.risk_level.slice(1)} Risk
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
