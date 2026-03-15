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

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showNewClient, setShowNewClient] = useState(false);
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '' });
  const [newInvoice, setNewInvoice] = useState({
    client_id: '',
    invoice_number: '',
    amount: '',
    due_date: '',
  });
  const [addingClient, setAddingClient] = useState(false);
  const [addingInvoice, setAddingInvoice] = useState(false);
  const [clientError, setClientError] = useState('');
  const [invoiceError, setInvoiceError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        router.push('/auth');
      } else {
        setUser(data.session.user);
        await fetchData(data.session.user.id);
      }
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const fetchData = async (userId: string) => {
    try {
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId);
      
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId);

      if (clientsError) console.error('Clients error:', clientsError);
      if (invoicesError) console.error('Invoices error:', invoicesError);

      setClients(clientsData || []);
      setInvoices(invoicesData || []);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const addClient = async () => {
    if (!newClient.name.trim()) {
      setClientError('Please enter a client name');
      return;
    }

    setAddingClient(true);
    setClientError('');

    try {
      const { data, error } = await supabase.from('clients').insert([
        { name: newClient.name, email: newClient.email, user_id: user.id },
      ]).select();

      if (error) {
        setClientError(error.message);
        console.error('Insert error:', error);
      } else {
        setNewClient({ name: '', email: '' });
        setShowNewClient(false);
        await fetchData(user.id);
        setClientError('');
      }
    } catch (error: any) {
      setClientError(error.message || 'Failed to add client');
      console.error('Add client error:', error);
    } finally {
      setAddingClient(false);
    }
  };

  const addInvoice = async () => {
    if (!newInvoice.client_id || !newInvoice.invoice_number || !newInvoice.amount || !newInvoice.due_date) {
      setInvoiceError('Please fill in all fields');
      return;
    }

    setAddingInvoice(true);
    setInvoiceError('');

    try {
      const { data, error } = await supabase.from('invoices').insert([
        {
          client_id: newInvoice.client_id,
          invoice_number: newInvoice.invoice_number,
          amount: parseFloat(newInvoice.amount),
          due_date: newInvoice.due_date,
          user_id: user.id,
          status: 'pending',
          paid_date: null,
        },
      ]).select();

      if (error) {
        setInvoiceError(error.message);
        console.error('Insert error:', error);
      } else {
        setNewInvoice({ client_id: '', invoice_number: '', amount: '', due_date: '' });
        setShowNewInvoice(false);
        await fetchData(user.id);
        setInvoiceError('');
      }
    } catch (error: any) {
      setInvoiceError(error.message || 'Failed to add invoice');
      console.error('Add invoice error:', error);
    } finally {
      setAddingInvoice(false);
    }
  };

  const markInvoicePaid = async (invoiceId: string, dueDate: string) => {
    const paidDate = new Date().toISOString().split('T')[0];
    const status = new Date(paidDate) > new Date(dueDate) ? 'paid_late' : 'paid_on_time';

    try {
      const { error } = await supabase
        .from('invoices')
        .update({ paid_date: paidDate, status })
        .eq('id', invoiceId);

      if (error) {
        console.error('Update error:', error);
      } else {
        await fetchData(user.id);
      }
    } catch (error) {
      console.error('Mark paid error:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading)
    return (
      <div style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'white', fontSize: '20px' }}>Loading...</div>
      </div>
    );

  const totalOwed = invoices
    .filter((inv) => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.amount, 0);
  const overdue = invoices.filter((inv) => inv.status === 'pending' && new Date(inv.due_date) < new Date());
  const latePayments = invoices.filter((inv) => inv.status === 'paid_late');

  return (
    <div style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed, #ec4899)', minHeight: '100vh', color: 'white', padding: '32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>DueMate Dashboard</h1>
          <button
            onClick={handleSignOut}
            style={{ padding: '8px 24px', background: '#dc2626', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '16px' }}>
          {['overview', 'invoices', 'clients'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 24px',
                fontWeight: 'bold',
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                opacity: activeTab === tab ? 1 : 0.6,
                borderBottom: activeTab === tab ? '2px solid white' : 'none',
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>${totalOwed.toFixed(2)}</div>
                <p style={{ fontSize: '14px', opacity: 0.8 }}>Total Owed</p>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>{overdue.length}</div>
                <p style={{ fontSize: '14px', opacity: 0.8 }}>Overdue Invoices</p>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>{latePayments.length}</div>
                <p style={{ fontSize: '14px', opacity: 0.8 }}>Late Payments</p>
              </div>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Overdue Invoices</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {overdue.length === 0 ? (
                <p style={{ opacity: 0.7 }}>No overdue invoices! 🎉</p>
              ) : (
                overdue.map((inv) => {
                  const client = clients.find((c) => c.id === inv.client_id);
                  const daysOverdue = Math.floor((new Date().getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={inv.id} style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <div>
                        <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{client?.name || 'Unknown'}</p>
                        <p style={{ fontSize: '14px', opacity: 0.7 }}>Invoice #{inv.invoice_number} · ${inv.amount.toFixed(2)}</p>
                        <p style={{ fontSize: '14px', color: '#fca5a5' }}>{daysOverdue} days overdue</p>
                      </div>
                      <button
                        onClick={() => markInvoicePaid(inv.id, inv.due_date)}
                        style={{ padding: '8px 16px', background: '#22c55e', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Mark Paid
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div>
            <button
              onClick={() => setShowNewInvoice(!showNewInvoice)}
              style={{ marginBottom: '24px', padding: '10px 20px', background: '#22c55e', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {showNewInvoice ? '✕ Cancel' : '+ New Invoice'}
            </button>

            {showNewInvoice && (
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px', marginBottom: '24px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <select
                  value={newInvoice.client_id}
                  onChange={(e) => setNewInvoice({ ...newInvoice, client_id: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', marginBottom: '12px', background: 'white', color: 'black', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
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
                  style={{ width: '100%', padding: '10px 12px', marginBottom: '12px', background: 'white', color: 'black', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={newInvoice.amount}
                  onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                  step="0.01"
                  style={{ width: '100%', padding: '10px 12px', marginBottom: '12px', background: 'white', color: 'black', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />
                <input
                  type="date"
                  value={newInvoice.due_date}
                  onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', marginBottom: '12px', background: 'white', color: 'black', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />
                {invoiceError && <p style={{ color: '#fca5a5', marginBottom: '12px' }}>{invoiceError}</p>}
                <button
                  onClick={addInvoice}
                  disabled={addingInvoice}
                  style={{ width: '100%', padding: '10px 12px', background: addingInvoice ? '#9ca3af' : '#3b82f6', color: 'white', borderRadius: '8px', border: 'none', cursor: addingInvoice ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                >
                  {addingInvoice ? 'Adding...' : 'Add Invoice'}
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {invoices.length === 0 ? (
                <p style={{ opacity: 0.7 }}>No invoices yet. Create one to get started!</p>
              ) : (
                invoices.map((inv) => {
                  const client = clients.find((c) => c.id === inv.client_id);
                  const statusColor =
                    inv.status === 'paid_on_time'
                      ? '#22c55e'
                      : inv.status === 'paid_late'
                      ? '#f97316'
                      : new Date(inv.due_date) < new Date()
                      ? '#ef4444'
                      : '#3b82f6';
                  return (
                    <div key={inv.id} style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <div>
                        <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{client?.name || 'Unknown'}</p>
                        <p style={{ fontSize: '14px', opacity: 0.7 }}>Invoice #{inv.invoice_number} · ${inv.amount.toFixed(2)}</p>
                        <p style={{ fontSize: '12px', opacity: 0.6 }}>Due: {new Date(inv.due_date).toLocaleDateString()}</p>
                      </div>
                      <span style={{ background: statusColor, padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', textTransform: 'capitalize' }}>
                        {inv.status.replace('_', ' ')}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div>
            <button
              onClick={() => setShowNewClient(!showNewClient)}
              style={{ marginBottom: '24px', padding: '10px 20px', background: '#22c55e', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {showNewClient ? '✕ Cancel' : '+ New Client'}
            </button>

            {showNewClient && (
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px', marginBottom: '24px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <input
                  type="text"
                  placeholder="Client Name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', marginBottom: '12px', background: 'white', color: 'black', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', marginBottom: '12px', background: 'white', color: 'black', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />
                {clientError && <p style={{ color: '#fca5a5', marginBottom: '12px' }}>{clientError}</p>}
                <button
                  onClick={addClient}
                  disabled={addingClient}
                  style={{ width: '100%', padding: '10px 12px', background: addingClient ? '#9ca3af' : '#3b82f6', color: 'white', borderRadius: '8px', border: 'none', cursor: addingClient ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                >
                  {addingClient ? 'Adding...' : 'Add Client'}
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {clients.length === 0 ? (
                <p style={{ opacity: 0.7 }}>No clients yet. Add one to get started!</p>
              ) : (
                clients.map((client) => {
                  const clientInvoices = invoices.filter((inv) => inv.client_id === client.id);
                  const lateCount = clientInvoices.filter((inv) => inv.status === 'paid_late').length;
                  const avgDaysLate =
                    lateCount > 0
                      ? (
                          clientInvoices
                            .filter((inv) => inv.status === 'paid_late')
                            .reduce((sum, inv) => {
                              const daysLate = Math.floor(
                                (new Date(inv.paid_date!).getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24)
                              );
                              return sum + daysLate;
                            }, 0) / lateCount
                        ).toFixed(1)
                      : '0';
                  return (
                    <div key={client.id} style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '20px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{client.name}</p>
                      <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '16px' }}>{client.email || 'No email'}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '12px' }}>
                        <div>
                          <p style={{ opacity: 0.6 }}>Total Invoices</p>
                          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{clientInvoices.length}</p>
                        </div>
                        <div>
                          <p style={{ opacity: 0.6 }}>Late Payments</p>
                          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{lateCount}</p>
                        </div>
                        <div>
                          <p style={{ opacity: 0.6 }}>Avg Days Late</p>
                          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{avgDaysLate}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
