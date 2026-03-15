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

interface Subscription {
  status: string;
  invoiceLimit: number;
  clientLimit: number;
  daysLeftInTrial: number;
  trialEndsAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [clients, setClients] = useState<Client[]>([]);
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

      setNewInvoice({ client_id: '', invoice_number: '', amount: '', due_date: '' });
      setShowInvoiceForm(false);
      setSuccess('Invoice added successfully');
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

  // Fixed: Show ALL pending invoices, not just overdue ones
  const allPendingInvoices = invoices.filter(inv => inv.status === 'pending');
  const overdueInvoices = allPendingInvoices.filter(inv => new Date(inv.due_date) < new Date());
  const totalOwed = allPendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const latePayments = invoices.filter(inv => inv.status === 'paid_late').length;

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
            <p style={{ fontSize: '13px', color: '#1e40af', opacity: 0.8 }}>Upgrade to Pro for unlimited invoices and clients.</p>
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

            {/* All Pending Invoices */}
            {allPendingInvoices.length > 0 && (
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Pending Invoices</h3>
                <div style={{ background: '#f8f8f8', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                  {allPendingInvoices.map((inv, idx) => {
                    const client = clients.find(c => c.id === inv.client_id);
                    const daysOverdue = Math.floor((new Date().getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24));
                    const isOverdue = new Date(inv.due_date) < new Date();
                    
                    return (
                      <div key={inv.id} style={{ padding: '16px', borderBottom: idx < allPendingInvoices.length - 1 ? '1px solid #e0e0e0' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontWeight: '600', marginBottom: '4px' }}>Invoice #{inv.invoice_number}</p>
                          <p style={{ fontSize: '14px', color: '#666' }}>
                            {client?.name} • ${inv.amount.toFixed(2)} • Due {inv.due_date}
                            {isOverdue && ` • ${daysOverdue} days overdue`}
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
                            📧 Remind Client
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
                  const clientInvoices = invoices.filter(inv => inv.client_id === client.id);
                  const latePaymentsForClient = clientInvoices.filter(inv => inv.status === 'paid_late').length;
                  const avgDaysLate = latePaymentsForClient > 0
                    ? Math.round(clientInvoices
                        .filter(inv => inv.status === 'paid_late')
                        .reduce((sum, inv) => sum + Math.floor((new Date(inv.paid_date!).getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24)), 0) / latePaymentsForClient)
                    : 0;

                  return (
                    <div key={client.id} style={{ padding: '16px', borderBottom: i < clients.length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                      <p style={{ fontWeight: '600', marginBottom: '8px' }}>{client.name}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', fontSize: '14px', color: '#666' }}>
                        <div>
                          <p style={{ fontSize: '12px', color: '#999', fontWeight: '600', marginBottom: '4px' }}>TOTAL INVOICES</p>
                          <p style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>{clientInvoices.length}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '12px', color: '#999', fontWeight: '600', marginBottom: '4px' }}>LATE PAYMENTS</p>
                          <p style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>{latePaymentsForClient}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '12px', color: '#999', fontWeight: '600', marginBottom: '4px' }}>AVG DAYS LATE</p>
                          <p style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>{avgDaysLate}</p>
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
