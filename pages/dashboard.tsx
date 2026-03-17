import Link from 'next/link';
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

interface CashFlowForecast {
  totalOwed: number;
  projectedIncome: number;
  projectedDate: string;
  breakdown: Array<{ clientName: string; amount: number; projectedDate: string }>;
  accuracy: string;
}

const paymentTermsTemplates = [
  {
    id: 'net-7',
    name: 'Net 7',
    days: 7,
    icon: '📅',
    content: `DueMate Payment Terms - Net 7\n\nGenerated: ${new Date().toLocaleDateString()}\n\nPAYMENT TERMS\nInvoice is due within 7 days of receipt.\n\nLATE PAYMENT FEES\nA late payment fee of 1.5% per month (18% annually) will be applied to any outstanding balance not paid by the due date.\n\nExample: If an invoice for $1,000 is 30 days late, the client owes an additional $15 in late fees.\n\nPAYMENT METHOD\nPayment should be made via [your preferred method].\n\nDISPUTES\nAny invoice disputes must be reported within 5 days of receipt.\n\nCLOSING\nFailure to pay by the due date may result in suspension of services and legal action to recover the debt.`,
  },
  {
    id: 'net-15',
    name: 'Net 15',
    days: 15,
    icon: '📅',
    content: `DueMate Payment Terms - Net 15\n\nGenerated: ${new Date().toLocaleDateString()}\n\nPAYMENT TERMS\nInvoice is due within 15 days of receipt.\n\nLATE PAYMENT FEES\nA late payment fee of 1.5% per month (18% annually) will be applied to any outstanding balance not paid by the due date.\n\nPAYMENT METHOD\nPayment should be made via [your preferred method].\n\nDISPUTES\nAny invoice disputes must be reported within 5 days of receipt.\n\nCLOSING\nFailure to pay by the due date may result in suspension of services.`,
  },
  {
    id: 'net-30',
    name: 'Net 30',
    days: 30,
    icon: '📅',
    content: `DueMate Payment Terms - Net 30\n\nGenerated: ${new Date().toLocaleDateString()}\n\nPAYMENT TERMS\nInvoice is due within 30 days of receipt.\n\nLATE PAYMENT FEES\nA late payment fee of 1.5% per month (18% annually) will be applied to any outstanding balance not paid by the due date.\n\nPAYMENT METHOD\nPayment should be made via [your preferred method].\n\nDISPUTES\nAny invoice disputes must be reported within 5 days of receipt.\n\nCLOSING\nFailure to pay by the due date may result in suspension of services.`,
  },
  {
    id: 'net-45',
    name: 'Net 45',
    days: 45,
    icon: '📅',
    content: `DueMate Payment Terms - Net 45\n\nGenerated: ${new Date().toLocaleDateString()}\n\nPAYMENT TERMS\nInvoice is due within 45 days of receipt.\n\nLATE PAYMENT FEES\nA late payment fee of 1.5% per month (18% annually) will be applied to any outstanding balance not paid by the due date.\n\nPAYMENT METHOD\nPayment should be made via [your preferred method].\n\nDISPUTES\nAny invoice disputes must be reported within 5 days of receipt.\n\nCLOSING\nFailure to pay by the due date may result in suspension of services.`,
  },
  {
    id: '50-50-milestone',
    name: '50/50 Milestone',
    days: 0,
    icon: '🎯',
    content: `DueMate Payment Terms - 50/50 Milestone\n\nGenerated: ${new Date().toLocaleDateString()}\n\nPAYMENT TERMS\nPayment is split into two equal installments: 50% due upon project initiation, 50% due upon project completion.\n\nLATE PAYMENT FEES\nA late payment fee of 1.5% per month (18% annually) will be applied to any outstanding balance not paid by the due date.\n\nPAYMENT METHOD\nPayment should be made via [your preferred method].\n\nDISPUTES\nAny disputes must be reported within 5 days of the invoice date.\n\nCLOSING\nFailure to pay by the due date may result in suspension or cancellation of services.`,
  },
  {
    id: 'deposit-balance',
    name: 'Deposit + Balance',
    days: 0,
    icon: '💰',
    content: `DueMate Payment Terms - Deposit + Balance\n\nGenerated: ${new Date().toLocaleDateString()}\n\nPAYMENT TERMS\nA deposit of [X]% is due upon project start. The remaining balance is due upon completion.\n\nLATE PAYMENT FEES\nA late payment fee of 1.5% per month (18% annually) will be applied to any outstanding balance not paid by the due date.\n\nPAYMENT METHOD\nPayment should be made via [your preferred method].\n\nDISPUTES\nAny disputes must be reported within 5 days of the invoice date.\n\nCLOSING\nFailure to pay by the due date may result in suspension or cancellation of services.`,
  },
];

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
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState({ name: '', email: '' });
  const [newInvoice, setNewInvoice] = useState({ client_id: '', invoice_number: '', amount: '', due_date: '' });
  const [loadingAction, setLoadingAction] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [cashFlowForecast, setCashFlowForecast] = useState<CashFlowForecast | null>(null);
  const [lateFeeCalculator, setLateFeeCalculator] = useState({ amount: '', daysLate: '' });
  const [lateFeeResult, setLateFeeResult] = useState<{ fee: number; total: number } | null>(null);
  const [selectedClientForPlus, setSelectedClientForPlus] = useState<string>('');

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
      const scoresMap: Record<string, ClientScore> = {};
      (scoreData || []).forEach((score: any) => {
        scoresMap[score.client_id] = score;
      });
      setClientScores(scoresMap);

      await fetchCashFlowForecast(userId);
    } catch (error) {
      console.error('Fetch error:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    }
  };

  const fetchCashFlowForecast = async (userId: string) => {
    try {
      const response = await fetch('/api/forecast-cashflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (response.ok) {
        const data = await response.json();
        setCashFlowForecast(data);
      }
    } catch (error) {
      console.error('Forecast error:', error);
    }
  };

  const isFreeTrialUser = !subscription || (subscription?.status === 'trial');
  const clientCount = clients.length;
  const invoiceCount = invoices.length;
  const canAddMoreClients = !isFreeTrialUser || clientCount < 3;
  const canAddMoreInvoices = !isFreeTrialUser || invoiceCount < 6;

  const addClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.email) {
      setMessage({ type: 'error', text: 'Name and email are required' });
      return;
    }

    if (subscription?.status === 'trial' && !editingClient && clients.length >= 3) {
      setMessage({ type: 'error', text: 'Free trial limited to 3 clients. Upgrade to add more.' });
      return;
    }

    setLoadingAction(true);
    try {
      if (editingClient) {
        const { error } = await supabase
          .from('clients')
          .update({ name: newClient.name, email: newClient.email })
          .eq('id', editingClient.id);
        if (error) throw error;
        setMessage({ type: 'success', text: 'Client updated!' });
        setEditingClient(null);
      } else {
        const { error } = await supabase
          .from('clients')
          .insert([{ user_id: user.id, name: newClient.name, email: newClient.email }]);
        if (error) throw error;
        setMessage({ type: 'success', text: 'Client added!' });
      }
      setNewClient({ name: '', email: '' });
      setShowNewClient(false);
      await fetchData(user.id);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoadingAction(false);
    }
  };

  const deleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    setLoadingAction(true);
    try {
      const { error } = await supabase.from('clients').delete().eq('id', clientId);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Client deleted!' });
      await fetchData(user.id);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoadingAction(false);
    }
  };

  const startEditClient = (client: Client) => {
    setEditingClient(client);
    setNewClient({ name: client.name, email: client.email });
    setShowNewClient(true);
  };

  const cancelEditClient = () => {
    setEditingClient(null);
    setNewClient({ name: '', email: '' });
    setShowNewClient(false);
  };

  const addInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoice.client_id || !newInvoice.invoice_number || !newInvoice.amount || !newInvoice.due_date) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    if (subscription?.status === 'trial' && invoices.length >= 6) {
      setMessage({ type: 'error', text: 'Free trial limited to 6 invoices. Upgrade to add more.' });
      return;
    }

    setLoadingAction(true);
    try {
      const { data: invoiceData, error: invoiceError } = await supabase
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
        ])
        .select();

      if (invoiceError) throw invoiceError;

      // Schedule automated reminders (day 3 and day 7)
      if (invoiceData && invoiceData.length > 0) {
        const invoiceId = invoiceData[0].id;
        await fetch('/api/schedule-reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            invoiceId: invoiceId,
            clientId: newInvoice.client_id,
            dueDate: newInvoice.due_date,
          }),
        });
      }

      setNewInvoice({ client_id: '', invoice_number: '', amount: '', due_date: '' });
      setShowNewInvoice(false);
      setMessage({ type: 'success', text: 'Invoice created! Automated reminders scheduled for day 3 & 7.' });
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
      if (!client) {
        setMessage({ type: 'error', text: 'Client not found' });
        setLoadingAction(false);
        return;
      }

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
          recipientEmail: client.email || '',
          freelancerName: user.user_metadata?.full_name || 'Freelancer',
          clientName: client.name || 'Client',
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

  const downloadPaymentTerms = (templateId: string) => {
    const template = paymentTermsTemplates.find((t) => t.id === templateId);
    if (!template) return;

    const content = template.content;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `DueMate-Payment-Terms-${template.name.replace(' ', '-')}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setMessage({ type: 'success', text: `Downloaded ${template.name} payment terms!` });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const calculateLateFee = () => {
    if (!lateFeeCalculator.amount || !lateFeeCalculator.daysLate) {
      setMessage({ type: 'error', text: 'Please enter both amount and days late' });
      return;
    }
    const amount = parseFloat(lateFeeCalculator.amount);
    const daysLate = parseInt(lateFeeCalculator.daysLate);
    const monthsLate = daysLate / 30;
    const monthlyRate = 0.015;
    const fee = amount * monthlyRate * monthsLate;
    const total = amount + fee;
    setLateFeeResult({ fee: parseFloat(fee.toFixed(2)), total: parseFloat(total.toFixed(2)) });
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

  const getRiskBadgeText = (riskLevel: string) => {
    const texts: any = {
      low: '✓ Reliable',
      medium: '⚠ Medium Risk',
      high: '✗ High Risk',
      critical: '✗✗ Critical',
    };
    return texts[riskLevel] || 'Unknown';
  };

  const togglePlusAccess = async (clientId: string) => {
    if (!isFreeTrialUser) return;

    try {
      await supabase
        .from('clients')
        .update({ has_plus_access: true })
        .eq('id', clientId)
        .eq('user_id', user.id);

      // Reset other clients' Plus access
      await supabase
        .from('clients')
        .update({ has_plus_access: false })
        .eq('user_id', user.id)
        .neq('id', clientId);

      await fetchData(user.id);
      setSelectedClientForPlus(clientId);
      setMessage({ type: 'success', text: 'Plus features assigned to this client!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error toggling Plus access:', error);
    }
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

  const topClientsByReliability = Object.entries(clientScores)
    .sort(([, a], [, b]) => b.payment_reliability_score - a.payment_reliability_score)
    .slice(0, 5)
    .map(([clientId, score]) => ({
      clientId,
      ...score,
      client: clients.find((c) => c.id === clientId),
    }));

  const riskClients = Object.entries(clientScores)
    .filter(([, score]) => score.risk_level === 'high' || score.risk_level === 'critical')
    .map(([clientId, score]) => ({
      clientId,
      ...score,
      client: clients.find((c) => c.id === clientId),
    }));

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#1f2937' }}>
      {/* Navigation */}
            {/* Navigation */}
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
  <img src="/logo.png" alt="DueMate" style={{ height: '120px', width: 'auto', cursor: 'pointer' }} onClick={() => router.push('/')} />
  <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
    <Link href="/dashboard" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Dashboard</Link>
    <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} style={{ background: '#ef4444', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>Sign Out</button>
  </div>
</nav>
      {/* Trial Banner */}
      {subscription?.status === 'trial' && (
        <div style={{ background: '#dbeafe', borderBottom: '1px solid #bfdbfe', padding: '16px 40px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#1e40af', fontWeight: 600 }}>
            🎉 You're on a free 7-day trial (limited to 3 clients, 6 invoices). Upgrade to Pro ($12/mo) or Plus ($29/mo) for unlimited access.
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

            {/* CLIENT RELIABILITY SCORE - PROMINENT */}
            <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '40px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginTop: 0, marginBottom: '20px' }}>🎯 Client Reliability Scores</h3>
              {topClientsByReliability.length > 0 ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {topClientsByReliability.map((item) => (
                      <div key={item.clientId} style={{ padding: '16px', background: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937' }}>{item.client?.name || 'Unknown'}</div>
                          <div
                            style={{
                              background: getRiskColor(item.risk_level),
                              color: 'white',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 600,
                            }}
                          >
                            {getRiskBadgeText(item.risk_level)}
                          </div>
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: getRiskColor(item.risk_level), marginBottom: '8px' }}>
                          {item.payment_reliability_score.toFixed(0)}/100
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                          Avg days to pay: <strong>{item.avg_days_to_pay.toFixed(0)} days</strong>
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {item.paid_invoices} of {item.total_invoices} paid on time
                        </div>
                      </div>
                    ))}
                  </div>
                  {riskClients.length > 0 && (
                    <div style={{ marginTop: '20px', padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#991b1b', marginTop: 0, marginBottom: '8px' }}>⚠️ High Risk Clients</h4>
                      {riskClients.map((item) => (
                        <div key={item.clientId} style={{ fontSize: '13px', color: '#7c2d12', marginBottom: '4px' }}>
                          • {item.client?.name} ({getRiskBadgeText(item.risk_level)})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                  Create invoices to see client reliability scores
                </div>
              )}
            </div>

            {/* Payment Terms Templates */}
            <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '40px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginTop: 0, marginBottom: '20px' }}>📋 Payment Terms Templates</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                {paymentTermsTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => downloadPaymentTerms(template.id)}
                    style={{
                      background: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#1f2937',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#e5e7eb';
                      e.currentTarget.style.borderColor = '#9ca3af';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f3f4f6';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                  >
                    {template.icon} {template.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Late Fee Calculator */}
            <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '40px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginTop: 0, marginBottom: '20px' }}>💰 Late Fee Calculator</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <input
                  type="number"
                  placeholder="Invoice Amount ($)"
                  value={lateFeeCalculator.amount}
                  onChange={(e) => setLateFeeCalculator({ ...lateFeeCalculator, amount: e.target.value })}
                  style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                />
                <input
                  type="number"
                  placeholder="Days Late"
                  value={lateFeeCalculator.daysLate}
                  onChange={(e) => setLateFeeCalculator({ ...lateFeeCalculator, daysLate: e.target.value })}
                  style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                />
                <button
                  onClick={calculateLateFee}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    padding: '10px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  Calculate
                </button>
              </div>
              {lateFeeResult && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '14px', color: '#166534', marginBottom: '8px' }}>
                    Late Fee (1.5%/month): <strong>${lateFeeResult.fee.toFixed(2)}</strong>
                  </div>
                  <div style={{ fontSize: '16px', color: '#166534', fontWeight: 700 }}>
                    Total Due: <strong>${lateFeeResult.total.toFixed(2)}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Cash Flow Forecast (Plus only) */}
            {subscription?.plan === 'plus' && cashFlowForecast && (
              <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '40px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginTop: 0, marginBottom: '20px' }}>📈 Cash Flow Forecast</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, marginBottom: '8px' }}>TOTAL OWED</div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#1f2937' }}>${cashFlowForecast.totalOwed.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, marginBottom: '8px' }}>PROJECTED INCOME</div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#10b981' }}>${cashFlowForecast.projectedIncome.toFixed(2)}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>by {cashFlowForecast.projectedDate}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, marginBottom: '8px' }}>ACCURACY</div>
                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: cashFlowForecast.accuracy === 'High' ? '#10b981' : cashFlowForecast.accuracy === 'Medium' ? '#f59e0b' : '#ef4444',
                      }}
                    >
                      {cashFlowForecast.accuracy}
                    </div>
                  </div>
                </div>
                {cashFlowForecast.breakdown.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Payment Schedule</h4>
                    {cashFlowForecast.breakdown.slice(0, 5).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6', fontSize: '14px' }}>
                        <span>{item.clientName}</span>
                        <div>
                          <span style={{ fontWeight: 600, marginRight: '12px' }}>${item.amount.toFixed(2)}</span>
                          <span style={{ color: '#6b7280' }}>{item.projectedDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Pending Invoices with badges */}
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
                    const score = clientScores[invoice.client_id];

                    return (
                      <div key={invoice.id} style={{ padding: '16px', background: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '15px', fontWeight: 600, color: '#1f2937', marginBottom: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            Invoice #{invoice.invoice_number}
                            {isOverdue && <span style={{ background: '#fecaca', color: '#7c2d12', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>⚠️ {daysOverdue}d overdue</span>}
                          </div>
                          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                            {client?.name || 'Unknown Client'} • ${invoice.amount.toFixed(2)} • Due {invoice.due_date}
                          </div>
                          {score && (
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              Client reliability: <span style={{ color: getRiskColor(score.risk_level), fontWeight: 600 }}>{score.payment_reliability_score.toFixed(0)}/100</span>
                            </div>
                          )}
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
                <h4 style={{ fontSize: '16px', fontWeight: 700, marginTop: 0, marginBottom: '20px' }}>Create New Invoice</h4>
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

            {/* Invoices List */}
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
              onClick={() => {
                if (editingClient) cancelEditClient();
                else setShowNewClient(!showNewClient);
              }}
              style={{ background: '#3b82f6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, marginBottom: '20px' }}
            >
              {showNewClient ? '✕ Cancel' : '+ New Client'}
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
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" disabled={loadingAction} style={{ background: '#10b981', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: loadingAction ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 600, opacity: loadingAction ? 0.6 : 1 }}>
                    {editingClient ? 'Update Client' : 'Add Client'}
                  </button>
                  {editingClient && (
                    <button type="button" onClick={cancelEditClient} style={{ background: '#6b7280', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Plus Access Assignment (Free Trial Only) */}
            {isFreeTrialUser && (
              <div style={{ background: '#e0f2fe', border: '1px solid #7dd3fc', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px 0', color: '#0369a1' }}>🎁 Try Plus Features Free</h4>
                <p style={{ fontSize: '13px', color: '#0c4a6e', margin: '0 0 12px 0' }}>Assign Plus plan features (cash flow forecasting, advanced analytics) to one client to test before upgrading.</p>
                {clients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => togglePlusAccess(client.id)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 12px',
                      marginBottom: '8px',
                      background: client.id === selectedClientForPlus ? '#06b6d4' : '#f0f9ff',
                      color: client.id === selectedClientForPlus ? 'white' : '#0369a1',
                      border: '1px solid ' + (client.id === selectedClientForPlus ? '#06b6d4' : '#7dd3fc'),
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    {client.id === selectedClientForPlus ? '✓ ' : '○ '} {client.name}
                  </button>
                ))}
              </div>
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
                          <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                            ${paidAmount.toFixed(2)} paid of ${totalAmount.toFixed(2)}
                          </div>
                          {score && (
                            <div style={{ fontSize: '12px', fontWeight: 600, color: getRiskColor(score.risk_level) }}>
                              Reliability: {score.payment_reliability_score.toFixed(0)}/100 • {getRiskBadgeText(score.risk_level)}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
                          <button
                            onClick={() => startEditClient(client)}
                            style={{
                              background: '#f3f4f6',
                              color: '#1f2937',
                              padding: '6px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 600,
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteClient(client.id)}
                            disabled={loadingAction}
                            style={{
                              background: '#fee2e2',
                              color: '#dc2626',
                              padding: '6px 12px',
                              border: '1px solid #fecaca',
                              borderRadius: '4px',
                              cursor: loadingAction ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              fontWeight: 600,
                              opacity: loadingAction ? 0.6 : 1,
                            }}
                          >
                            Delete
                          </button>
                        </div>
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
