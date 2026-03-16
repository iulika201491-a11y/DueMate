import { supabase } from '../../lib/supabase';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const { data: invoices, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId);

    if (invoiceError) throw invoiceError;

    const { data: clientStats, error: statsError } = await supabase
      .from('client_statistics')
      .select('*')
      .eq('user_id', userId);

    if (statsError) throw statsError;

    if (!invoices || invoices.length === 0) {
      return res.status(200).json({
        totalOwed: 0,
        projectedIncome: 0,
        projectedDate: new Date().toISOString().split('T')[0],
        breakdown: [],
        accuracy: 'Low (no data)',
        message: 'Add invoices to see cash flow forecast'
      });
    }

    const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
    const totalOwed = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    const breakdown = pendingInvoices.map(invoice => {
      const client = clientStats?.find(cs => cs.client_id === invoice.client_id);
      const avgDaysToPay = client?.avg_days_to_pay || 30;
      
      const dueDate = new Date(invoice.due_date);
      const projectedPayDate = new Date(dueDate);
      projectedPayDate.setDate(projectedPayDate.getDate() + avgDaysToPay);

      return {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoice_number,
        clientId: invoice.client_id,
        amount: invoice.amount,
        dueDate: invoice.due_date,
        avgDaysToPay: avgDaysToPay,
        projectedPayDate: projectedPayDate.toISOString().split('T')[0],
        daysUntilPayment: Math.ceil(
          (projectedPayDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
      };
    });

    breakdown.sort((a, b) => 
      new Date(a.projectedPayDate).getTime() - new Date(b.projectedPayDate).getTime()
    );

    const projectedDate = breakdown.length > 0 
      ? breakdown[Math.ceil(breakdown.length / 2) - 1].projectedPayDate
      : new Date().toISOString().split('T')[0];

    const paidInvoices = invoices.filter(inv => inv.status !== 'pending').length;
    let accuracy = 'Low (few historical invoices)';
    if (paidInvoices >= 10) accuracy = 'High (based on 10+ invoices)';
    else if (paidInvoices >= 5) accuracy = 'Medium (based on 5+ invoices)';

    return res.status(200).json({
      totalOwed: parseFloat(totalOwed.toFixed(2)),
      projectedIncome: parseFloat(totalOwed.toFixed(2)),
      projectedDate: projectedDate,
      breakdown: breakdown,
      accuracy: accuracy,
      message: null
    });
  } catch (error: any) {
    console.error('Forecast error:', error);
    return res.status(500).json({ error: error.message || 'Failed to forecast' });
  }
}
